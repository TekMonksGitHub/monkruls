/** 
 * monkruls.js, Main rules engine process. 
 * (C) 2020 TekMonks. All rights reserved.
 */
const path = require("path");
const mustache = require("mustache");
const csvparser = require("papaparse");
const fspromises = require("fs").promises;
global.CONSTANTS = require(`${__dirname}/constants.js`);
const logger = require(`${CONSTANTS.LIBDIR}/log.js`);
const utils = require(`${CONSTANTS.LIBDIR}/utils.js`);
const conf = require(`${CONSTANTS.CONFDIR}/monkruls.json`);
const coreRuleFuncs = require(`${CONSTANTS.LIBDIR}/rulsCoreFunctions.js`);
const CLONE_OBJECT = obj => JSON.parse(JSON.stringify(obj));
const MAKE_ARRAY = obj => obj?(Array.isArray(obj)?[...obj]:[obj]):[];

function _mergeObjectHeaders(objArray) {
    const retObj = {}, keys = Object.keys(objArray[0]);
    for (const key of keys) retObj[key] = [];
    for (const obj of objArray) for (const key of keys) if (obj[key] && obj[key].trim()!='') retObj[key].push(obj[key]);
    return retObj;
}

function _createLookupTable(objArray) {
    const table = {}; for (const object of objArray) table[object[Object.keys(object)[0]]] = object[Object.keys(object)[1]];
    return table;
}

async function _parseCSV(path, isLookupTable) {
    const parsedCSV = csvparser.parse(await fspromises.readFile(path, "utf-8"), {header: true, skipEmptyLines: true, delimiter: ","});
    if (parsedCSV.errors.length) throw `Error parsing CSV ${path} ${JSON.stringify(parsedCSV.errors)}`;
    else if (!isLookupTable) return _mergeObjectHeaders(parsedCSV.data); 
    else return _createLookupTable(parsedCSV.data);
}

const _objectToCSV = object => csvparser.unparse(object, {header: true, delimiter: ","});

async function _parseObjects(objectDefinitions) {
    if (!Array.isArray(objectDefinitions)) objectDefinitions = objectDefinitions?[objectDefinitions]:[];

    const retObjects = {};
    for (const objectDefinition of objectDefinitions) {
        const objToParse = Object.values(objectDefinition)[0], key = Object.keys(objectDefinition)[0]; 
        if (typeof objToParse == "string" && objToParse.toLowerCase().endsWith(".json")) retObjects[key] = JSON.parse(await fspromises.readFile(objToParse));
        else if (typeof objToParse == "string" && objToParse.toLowerCase().endsWith("lookup_table.csv")) retObjects[key] = await _parseCSV(objToParse, true);
        else if (typeof objToParse == "string" && objToParse.toLowerCase().endsWith(".csv")) retObjects[key] = await _parseCSV(objToParse, false);
        else if (typeof objToParse == "string") retObjects[key] = JSON.parse(objToParse);
        else if (objToParse instanceof Object) retObjects[key] = CLONE_OBJECT(objToParse);
    }

    return retObjects;
}

function _runRulesBundleOnData(rules, __internal_objects, __internal_data) {  // yes eval is bad in browser, but here it really is useful plus keeps variables function scoped, var is important below, can't use let or const
    let ruleRunning; const failedRules = [];
    try {
        for (const key of Object.keys(__internal_objects)) eval(`var ${key} = __internal_objects["${key}"]`);
        for (const key of Object.keys(__internal_data)) eval(`var ${key} = __internal_data["${key}"]`);
        for (const key of Object.keys(coreRuleFuncs)) eval(`var ${key} = coreRuleFuncs["${key}"]`);
        for (const rule of rules) {
            ruleRunning = rule, rule_do = MAKE_ARRAY(rule.do), rule_else_do = MAKE_ARRAY(rule.else_do); 
            var $condition_value = eval(rule.condition); 
            if ($condition_value) for (const doThis of rule_do) eval(doThis); 
            else { failedRules.push(rule); for (const else_doThis of rule_else_do) eval(else_doThis); }
        }
        return failedRules;
    } catch (err) {
        const errMsg = `Error running rule ${JSON.stringify(ruleRunning)}, error is ${err}, dumping variables`; 
        LOG.error(errMsg); LOG.error(`Rules are ${JSON.stringify(rules)}`); 
        LOG.error(`Objects are ${JSON.stringify(__internal_objects)}`); LOG.error(`Data are ${JSON.stringify(__internal_data)}`); 
        throw errMsg;
    }
}

async function _writeOutput(object, path) {
    if (path.toLowerCase() == "console") LOG.console(JSON.stringify(object));
    else if (path.toLowerCase().endsWith(".json")) await fspromises.writeFile(path, JSON.stringify(object, null, 4), "utf-8");
    else if (path.toLowerCase().endsWith(".csv")) await fspromises.writeFile(path, _objectToCSV(MAKE_ARRAY(object)), "utf-8");
}

async function runRules(input, current_folder) {
    const parseData = {current_folder: current_folder.split(path.sep).join(path.posix.sep)}, timeStart = Date.now();
    input = JSON.parse(mustache.render(JSON.stringify(input), parseData));

    let objects = await _parseObjects(input.objects), data = await _parseObjects(input.data);
    const ruleBundles = []; for (const rule of input.rule_bundles) ruleBundles.push(JSON.parse(
        mustache.render(await fspromises.readFile(rule, "utf8"), input.rule_parameters)));
    
    let repeatLoop = false, loops = 0, failedRules, failedReasons = [];
    do {
        const objectsCopy = CLONE_OBJECT(objects); loops++; failedRules = [];
        for (const ruleBundle of ruleBundles) failedRules.push(..._runRulesBundleOnData(ruleBundle, objectsCopy, data));
        if (!utils.areObjectsSame(objectsCopy, objects)) {objects = objectsCopy; repeatLoop = true;} else repeatLoop = false;
    } while (repeatLoop && (conf.maxloops?loops<=conf.maxloops:true))
    if (loops>conf.maxloops) LOG.error(`Rule execution halted as loop count exceeded ${conf.maxloops}`); else LOG.info(`Rule run completed in ${loops} loops`);
    if (failedRules.length) { LOG.info("Information on failed rules follows"); 
        for (const failedRule of failedRules) { LOG.info(failedRule.reason); failedReasons.push({"reason":failedRule.reason}); } }
    const runTime = Date.now()-timeStart; LOG.info(`Execution time: ${runTime} milliseconds`);

    objects.$failed_rules = failedRules; objects.$failed_reasons = failedReasons; objects.$runtime = runTime;
    for (const output of input.outputs) await _writeOutput(objects[Object.keys(output)[0]], Object.values(output)[0]);
    return objects;
}

if (require.main === module) {
    process.argv.splice(0, 2); if (process.argv.length == 0) {
        console.error("Usage: monkruls <path to input descriptor>");
        process.exit(1);
    } else try { 
        logger.initGlobalLoggerSync(CONSTANTS.LOGMAIN); LOG.overrideConsole();
        LOG.info(`Processing input definition - ${process.argv[0]}`);
        (async _ => { 
            await runRules(JSON.parse(await fspromises.readFile(process.argv[0], "utf-8")), path.dirname(process.argv[0]));
            LOG.flush(_=>process.exit(0)); 
        })();
    } catch (err) {
        const msg = `Error reading input ${process.argv[0]}, error is ${err}`; LOG.error(msg, true); LOG.console(msg);
        process.exit(1);
    }
}

module.exports = {runRules};