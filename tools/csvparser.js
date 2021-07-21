/** 
 * Parses a CSV file as a normal file or lookup table. 
 * (C) 2021 TekMonks. All rights reserved.
 */
 const path = require("path");
global.CONSTANTS = require(`${__dirname}/../lib/constants.js`);
const logger = require(`${CONSTANTS.LIBDIR}/log.js`);
const monkruls = require(`${CONSTANTS.LIBDIR}/monkruls.js`);

if (require.main === module) {
    process.argv.splice(0, 2); if (process.argv.length == 0) {
        console.error("Usage: csvparser <path to csv>");
        process.exit(1);
    } else try { 
        logger.initGlobalLoggerSync(CONSTANTS.LOGMAIN); LOG.overrideConsole(); 
        LOG.console(`Parsing CSV file - ${path.resolve(process.argv[0])}\n\n`);
        (async _ => { 
            try { 
                const parsedObject = await monkruls.parseCSV(path.resolve(process.argv[0]), process.argv[0].toLowerCase().endsWith(".lookup_table.csv"));
                LOG.console(JSON.stringify(parsedObject));
            } catch (err) {LOG.error("Error in rules engine "+err); if (err.stack) LOG.error(err.stack);}
            LOG.flush(_=>process.exit(0)); 
        })();
    } catch (err) {
        const msg = `Error reading input ${process.argv[0]}, error is ${err}`; LOG.error(msg, true); LOG.console(msg);
        process.exit(1);
    }
}