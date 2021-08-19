/**
 * Initializes the application
 */
 exports.initSync = _=> {
     if (global.APP_CONSTANTS) global.APP_CONSTANTS.MONKRULS = require(`${__dirname}/../apis/lib/constants.js`);
     else global.APP_CONSTANTS = {MONKRULS: require(`${__dirname}/../apis/lib/constants.js`)};
 }