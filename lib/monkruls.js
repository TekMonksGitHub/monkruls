/** 
 * monkruls.js, Main rules engine process. 
 * (C) 2020 TekMonks. All rights reserved.
 */
const path = require("path");
const mustache = require("mustache");
const csvparser = require("papaparse");
const fspromises = require("fs").promises;
const utils = require(`${CONSTANTS.LIBDIR}/utils.js`);
const conf = require(`${CONSTANTS.CONFDIR}/monkruls.json`);
const coreRuleFuncs = require(`${CONSTANTS.LIBDIR}/rulsCoreFunctions.js`);
const CLONE_OBJECT = obj => JSON.parse(JSON.stringify(obj)), CSVLOOKUPTABLESCHEME = "csvlookuptable://", CSVSCHEME = "csv://";
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

async function parseCSV(path, isLookupTable, rawParse, renderWithMustache, dataForMustache={}) {
    const csvContents = renderWithMustache ? mustache.render(utils.isValidURI(path)?await fspromises.readFile(path, "utf-8"):path, dataForMustache) : 
            utils.isValidURI(path)?await fspromises.readFile(path, "utf-8"):path;
    const parsedCSV = csvparser.parse(csvContents, {header: true, skipEmptyLines: true, delimiter: ",", transformHeader: h=>h.trim()});
    if (parsedCSV.errors.length) throw `Error parsing CSV ${path} ${JSON.stringify(parsedCSV.errors)}`;
    if (rawParse) return parsedCSV.data;
    else if (!isLookupTable) return _mergeObjectHeaders(parsedCSV.data); 
    else return _createLookupTable(parsedCSV.data);
}

const _objectToCSV = object => csvparser.unparse(object, {header: true, delimiter: ","});

async function _parseObjects(objectDefinitions) {
    if (!Array.isArray(objectDefinitions)) objectDefinitions = objectDefinitions?[objectDefinitions]:[];

    const objects = {};
    for (const objectDefinition of objectDefinitions) {
        let objToParse = Object.values(objectDefinition)[0]; if (typeof objToParse === "string") objToParse = objToParse.trim();
        const key = Object.keys(objectDefinition)[0].trim(), functionRE = objToParse.match?.(/(.+)\((.+)\)/);
        if (typeof objToParse == "string" && utils.isValidURI(objToParse) && objToParse.toLowerCase().endsWith(".json")) objects[key] = JSON.parse(await fspromises.readFile(objToParse));
        else if (typeof objToParse == "string" && utils.isValidURI(objToParse) && objToParse.toLowerCase().endsWith(".lookup_table.csv")) objects[key] = await parseCSV(objToParse, true);
        else if (typeof objToParse == "string" && utils.isValidURI(objToParse) && objToParse.toLowerCase().endsWith(".csv")) objects[key] = await parseCSV(objToParse);
        else if (typeof objToParse == "string" && functionRE) objects[key] = coreRuleFuncs[functionRE[1]](functionRE[2], objects);
        else if (typeof objToParse == "string" && objToParse.startsWith(CSVSCHEME)) objects[key] = await parseCSV(objToParse.substring(CSVSCHEME.length));
        else if (typeof objToParse == "string" && objToParse.startsWith(CSVLOOKUPTABLESCHEME)) objects[key] = await parseCSV(objToParse.substring(CSVLOOKUPTABLESCHEME.length), true);
        else if (typeof objToParse == "string") objects[key] = JSON.parse(objToParse);
        else if (objToParse instanceof Object) objects[key] = CLONE_OBJECT(objToParse);
    }

    return objects;
}

function parseDecisionTable(rows, data) {    // parses a decision table into a regular rules bundle
    const makeCondition = (header, statement) => statement.indexOf("$")!=-1?statement.replace(/\$/g, header):header+statement;
    const ruleBundle = []; for (const row of rows) { const rule = {}; ruleBundle.push(rule); for (const header in row) { 
        if (!row[header].trim().length) continue;
        const doRE = header.match(/.+\((.+)\).*/); 
        if (doRE) rule.do = `${doRE[1]}="${row[header]}"`;
        else if (header.trim().toLowerCase() == "reason") rule.reason = row[header]
        else if (!utils.getObjectValue(header, data)) rule.do = rule.do?`[${rule.do.substring(1,rule.do.length-1)},${header}="${row[header]}"]`:`[${header}="${row[header]}"]`;
        else rule.condition = rule.condition?rule.condition+`&&(${makeCondition(header, row[header])})`:`(${makeCondition(header, row[header])})`;
    } }
    return ruleBundle;
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
    const parsedInput = JSON.parse(mustache.render(JSON.stringify(input), parseData)); await coreRuleFuncs.init(parsedInput.functions||[]);

    let objects = await _parseObjects(parsedInput.objects), data = await _parseObjects(parsedInput.data);
    const rule_params = {}; for (const param of parsedInput.rule_parameters) rule_params[param.name] = param.value;
    const ruleBundles = []; for (const rule of parsedInput.rule_bundles) {
        if (typeof rule == "string" && utils.isValidURI(rule) && rule.endsWith(".json")) ruleBundles.push(JSON.parse(mustache.render(await fspromises.readFile(rule, "utf8"), rule_params)));
        else if (typeof rule == "string" && utils.isValidURI(rule) && rule.endsWith(".decision_table.csv")) ruleBundles.push(parseDecisionTable(await parseCSV(rule, false, true, true, rule_params), objects));
		else if (rule instanceof Object && rule.rules && Array.isArray(rule.rules)) ruleBundles.push(JSON.parse(mustache.render(JSON.stringify(rule.rules), rule_params)));   // simple rules array
        else if (rule instanceof Object && rule.rules && typeof rule.rules == "string" && rule.rules.startsWith(CSVSCHEME)) ruleBundles.push(parseDecisionTable(await parseCSV(rule.rules.substring(CSVSCHEME.length), false, true, true, rule_params), objects)); // inline CSV for decision table
    }
    
    let repeatLoop = false, loops = 0, failedRules, failedReasons = [];
    do {
        const objectsCopy = CLONE_OBJECT(objects); loops++; failedRules = [];
        for (const ruleBundle of ruleBundles) failedRules.push(..._runRulesBundleOnData(ruleBundle, objectsCopy, data));
        if (!utils.areObjectsSame(objectsCopy, objects)) {objects = objectsCopy; repeatLoop = true;} else repeatLoop = false;
    } while (repeatLoop && (conf.maxloops?loops<=conf.maxloops:true))
    if (loops>conf.maxloops) LOG.error(`Rule execution halted as loop count exceeded ${conf.maxloops}`); else LOG.info(`Rule run completed in ${loops} loops`);
    if (failedRules.length) { LOG.info("Information on failed rules follows"); 
        for (const failedRule of failedRules) { LOG.info(failedRule.reason); if (failedRule.reason) failedReasons.push({"reason":failedRule.reason}); } }
    const runTime = Date.now()-timeStart; LOG.info(`Execution time: ${runTime} milliseconds`);

    objects.$failed_rules = failedRules; objects.$failed_reasons = failedReasons; objects.$runtime = runTime;
    const results = {}; for (const output of parsedInput.outputs) if (typeof output === "string") results[output] = objects[output]; 
        else {results[Object.keys(output)[0]]=objects[Object.keys(output)[0]]; await _writeOutput(objects[Object.keys(output)[0]], Object.values(output)[0]);}
    return {objects, results};
}

module.exports = {runRules, parseCSV, parseDecisionTable};