/** 
 * (C) 2020 TekMonks. All rights reserved.
 */

const path = require("path");
const rootdir = path.resolve(__dirname+"/../");

exports.ROOTDIR = rootdir;
exports.LIBDIR = path.normalize(rootdir+"/lib");
exports.LOGDIR = path.normalize(rootdir+"/logs");
exports.LOGMAIN = `${this.LOGDIR}/log.ndjson`;
exports.CONFDIR = path.normalize(rootdir+"/conf");
