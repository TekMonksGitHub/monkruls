/**
 * Command line interface to the monkruls engine
 */
const path = require("path");
const fspromises = require("fs").promises;
global.CONSTANTS = require(`${__dirname}/constants.js`);
const logger = require(`${CONSTANTS.LIBDIR}/log.js`);
const monkruls = require(`${CONSTANTS.LIBDIR}/monkruls.js`);

if (require.main === module) {
    process.argv.splice(0, 2); if (process.argv.length == 0) {
        console.error("Usage: monkruls <path to input descriptor>");
        process.exit(1);
    } else try { 
        logger.initGlobalLoggerSync(CONSTANTS.LOGMAIN); LOG.overrideConsole(); 
        LOG.info(`Processing input definition - ${process.argv[0]}`);
        (async _ => { 
            try { const {objects} = await monkruls.runRules(JSON.parse(await fspromises.readFile(process.argv[0], 
                "utf-8")), path.resolve(path.dirname(process.argv[0]))); LOG.console(`Done. Execution time: ${objects.$runtime} milliseconds.`); 
            } catch (err) {LOG.error("Error in rules engine "+err); if (err.stack) LOG.error(err.stack);}
            LOG.flush(_=>process.exit(0)); 
        })();
    } catch (err) {
        const msg = `Error reading input ${process.argv[0]}, error is ${err}`; LOG.error(msg, true); LOG.console(msg);
        process.exit(1);
    }
}
