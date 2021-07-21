/**
 * Monkrules entry point for Browserify.
 * (C) 2020 TekMonks. All rights reserved.
 */
global.CONSTANTS = require("./constants.js"); 
global.LOG = require(`${CONSTANTS.LIBDIR}/consolelog.js`);
const monkruls = require(`${CONSTANTS.LIBDIR}/monkruls.js`);

exports.runRules = async function(input) {return await monkruls.runRules(input);}