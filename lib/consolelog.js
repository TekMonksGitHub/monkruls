/**
 * consolelog.js, Logs to the console.
 * (C) 2020 TekMonks. All rights reserved.
 */
const info = s => console.log(s);
const debug = s => console.debug(s);
const error = s => console.error(s);
const flush = _ => {};

module.exports = {info, debug, error, console: info, flush};