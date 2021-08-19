/**
 * Monkruls API executor
 * (C) 2020 TekMonks. All rights reserved.
 */
 const fspromises = require("fs").promises;
 const CONF = require(`${APP_CONSTANTS.MONKRULS.CONF_DIR}/monkruls.json`), MONKRULS_CONSTANTS = require(`${APP_CONSTANTS.MONKRULS.APP_ROOT}/lib/constants.js`);
 
 exports.doService = async jsonReq => {
     if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
     
     LOG.debug("Run rules request for package: " + jsonReq.name + ", with objects: " + jsonReq.objects);
 
     const pubpath = `${APP_CONSTANTS.MONKRULS.APP_ROOT}/${CONF.pubpath}/${jsonReq.name}.${APP_CONSTANTS.MONKRULS.MONKRULS_EXTENSION}`;
 
     try {
        const input = JSON.parse(await fspromises.readFile(pubpath, "utf8"));
        input.objects = jsonReq.objects;

        // switch constants and run the rules engine
        const SAVED_CONSTANTS = global.CONSTANTS;
        global.CONSTANTS = MONKRULS_CONSTANTS; 
        const monkruls = require(`${CONSTANTS.LIBDIR}/monkruls.js`);
        const rulsResult = await monkruls.runRules(input);
        global.CONSTANTS = SAVED_CONSTANTS;

        LOG.debug(`Output of the rules run was ${JSON.stringify(rulsResult)}`);
        return {result: true, rulsResult, name: jsonReq.name, objects: jsonReq.objects};
     } catch (err) {
         LOG.error(`Error running rules package ${jsonReq.name}, error is ${err}`);
         return CONSTANTS.FALSE_RESULT;
     }
 }
 
 const validateRequest = jsonReq => (jsonReq && jsonReq.name && jsonReq.objects);