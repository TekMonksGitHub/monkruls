/**
 * Monkruls admin API
 * (C) 2020 TekMonks. All rights reserved.
 */
const fspromises = require("fs").promises;
const CONF = require(`${APP_CONSTANTS.MONKRULS.CONF_DIR}/monkruls.json`);

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
	
	LOG.debug("Admin request for package: " + jsonReq.name);

    const pubpath = `${APP_CONSTANTS.MONKRULS.APP_ROOT}/${CONF.pubpath}/${jsonReq.name}.${APP_CONSTANTS.MONKRULS.MONKRULS_EXTENSION}`;

    try {
        if ((jsonReq.op.toLowerCase() == "update") || (jsonReq.op.toLowerCase() == "add")) {
            await fspromises.writeFile(pubpath, JSON.stringify(jsonReq.input, null, 4), "utf8");
            LOG.info(`Published or updated a new rules package ${jsonReq.name}`);
            return CONSTANTS.TRUE_RESULT;
        } else if (jsonReq.op.toLowerCase() == "delete") {
            await fspromises.unlink(pubpath);
            LOG.info(`Deleted rules package ${jsonReq.name}`);
            return CONSTANTS.TRUE_RESULT;
        } else if (jsonReq.op.toLowerCase() == "read") {
            const data = JSON.parse(await fspromises.readFile(pubpath, "utf8"));
            LOG.info(`Read back rules package ${jsonReq.name}`);
            return {result: true, data};
        }
    } catch (err) {
        LOG.error(`Error running op ${jsonReq.op}, on rules package ${jsonReq.name}, error is ${err}`);
        return CONSTANTS.FALSE_RESULT;
    }

    LOG.error(`Error running op ${jsonReq.op}, on rules package ${jsonReq.name}, error is 'Unknown Operation'`);
    return CONSTANTS.FALSE_RESULT;  // unknown op
}

const validateRequest = jsonReq => (jsonReq && jsonReq.name && jsonReq.op && 
    (jsonReq.op == "add"?jsonReq.input:true) && (jsonReq.op == "update"?jsonReq.input:true));