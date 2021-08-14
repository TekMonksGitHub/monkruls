/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: GPL2 - see enclosed LICENSE file.
 */

const path = require("path");

APP_ROOT = `${path.resolve(`${__dirname}/../../`)}`;

exports.APP_ROOT = APP_ROOT;
exports.API_DIR = `${APP_ROOT}/apis`;
exports.CONF_DIR = `${APP_ROOT}/conf`;
exports.LIB_DIR = `${APP_ROOT}/apis/lib`;

exports.MONKRULS_EXTENSION = "monkruls.json";

/* Constants for the Login subsystem */
exports.SALT_PW = "$2a$10$VFyiln/PpFyZc.ABoi4ppf";
exports.APP_DB = `${APP_ROOT}/db/monkruls.db`;
