/**
 * Monkruls admin API
 * (C) 2020 TekMonks. All rights reserved.
 */
const fspromises = require("fs").promises;
const CONF = require(`${APP_CONSTANTS.MONKRULS.CONF_DIR}/monkruls.json`);

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
	
	LOG.debug("Admin request op is: " + jsonReq.op); if (jsonReq.name) LOG.debug("Admin request package is: " + jsonReq.name);
    
    const pubpath = `${APP_CONSTANTS.MONKRULS.APP_ROOT}/${CONF.pubpath}`;
    const pubpathFile = jsonReq.name?`${pubpath}/${jsonReq.name}.${APP_CONSTANTS.MONKRULS.MONKRULS_EXTENSION}`:null;

    try {
        if ((jsonReq.op.toLowerCase() == "update") || (jsonReq.op.toLowerCase() == "add")) {
            await fspromises.writeFile(pubpathFile, JSON.stringify(jsonReq.input, null, 4), "utf8");
            LOG.info(`Published or updated a new package ${jsonReq.name}`);
            return CONSTANTS.TRUE_RESULT;
        } else if (jsonReq.op.toLowerCase() == "delete") {
            await fspromises.unlink(pubpathFile);
            LOG.info(`Deleted package ${jsonReq.name}`);
            return CONSTANTS.TRUE_RESULT;
        } else if (jsonReq.op.toLowerCase() == "read") {
            const data = await fspromises.readFile(pubpathFile, "utf8");
            LOG.info(`Read back package ${jsonReq.name}`);
            return {result: true, data, name: jsonReq.name};
        } else if (jsonReq.op.toLowerCase() == "list") {
            const entries = await fspromises.readdir(pubpath);
            const list = []; for (const entry of entries) if (
                entry.endsWith(APP_CONSTANTS.MONKRULS.MONKRULS_EXTENSION)) list.push(entry.substring(0, 
                    entry.length - `.${APP_CONSTANTS.MONKRULS.MONKRULS_EXTENSION}`.length));
            LOG.info(`Sending back package list ${list}`);
            return {result: true, list};
        }
    } catch (err) {
        if (jsonReq.name) LOG.error(`Error running op ${jsonReq.op}, package name is ${jsonReq.name}, error is ${err}`);
        else LOG.error(`Error running op ${jsonReq.op}, error is ${err}`);
        return CONSTANTS.FALSE_RESULT;
    }

    if (jsonReq.name) LOG.error(`Error running op ${jsonReq.op}, on package ${jsonReq.name}, error is 'Unknown Operation'`);
    else LOG.error(`Error running op ${jsonReq.op}, error is 'Unknown Operation'`);
    return CONSTANTS.FALSE_RESULT;  // unknown op
}

const validateRequest = jsonReq => (jsonReq && jsonReq.op && 
    (jsonReq.op == "add"?(jsonReq.name && jsonReq.input):true) && 
    (jsonReq.op == "update"?(jsonReq.name && jsonReq.input):true) &&
    (jsonReq.op == "read"?jsonReq.name:true));