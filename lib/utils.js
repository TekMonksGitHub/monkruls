/** 
 * Utils for Monkruls
 * URI RE is from https://github.com/jhermsmeier/uri.regex/blob/master/pattern.js
 * (C) 2020 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 */
const vm = require("vm");
const fspromises = require("fs").promises;
const URI_REG_EXP = new RegExp( "([A-Za-z][A-Za-z0-9+\\-.]*):(?:(//)(?:((?:[A-Za-z0-9\\-._~!$&'()*+,;=:]|%[0-9A-Fa-f]{2})*)@)?((?:\\[(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|::(?:[0-9A-Fa-f]{1,4}:){5}|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::)(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)|[Vv][0-9A-Fa-f]+\\.[A-Za-z0-9\\-._~!$&'()*+,;=:]+)\\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[A-Za-z0-9\\-._~!$&'()*+,;=]|%[0-9A-Fa-f]{2})*))(?::([0-9]*))?((?:/(?:[A-Za-z0-9\\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)|/((?:(?:[A-Za-z0-9\\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:/(?:[A-Za-z0-9\\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)?)|((?:[A-Za-z0-9\\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:/(?:[A-Za-z0-9\\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)|)(?:\\?((?:[A-Za-z0-9\\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*))?(?:\\#((?:[A-Za-z0-9\\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*))?" );

/**
 * Returns true if the given path is a valid URI (disk patnh, URL etc)
 * @param {string} toCheck The URL to check
 * @returns true if the given path is a valid URI else false
 */
const isValidURI = toCheck => toCheck.match(URI_REG_EXP) != null;

/**
 * Loads the given module asynchronously and returns it's expors object
 * @param {string} module Path to the module or module code itself
 * @param {string} moduleIsPath Whether the module param is path (true) or code for the module (false)
 * @returns Loads the module and returns its exports object
 */
const requireAsync = async function (module, moduleIsPath) {
    try {
        const data = moduleIsPath?await fspromises.readFile(module, "utf8"):module;
        const sandbox = {module: {exports: {}}};
        const code = `(function (module) {exports=module.exports;${data}})(module)`;
        vm.runInNewContext(code, sandbox); return sandbox.module.exports;
    } catch (err) {return {};};  // import failed
}

/**
 * Returns true if the objects are the same, does a deep key/value comparison
 * @param {Object} object1 First object
 * @param {Object} object2 Second object
 * @returns true if the objects are the same, false otherwise
 */
function areObjectsSame(object1, object2) {
    if (typeof object1 != typeof object2) return false; 
    if ((object1 && !object2) || (!object1 && object2)) return false; if (!object1 && !object2) return true;
    if (typeof object1 != "object") return object1 == object2;
    
    const keys = Object.keys(object1); if (keys.length != Object.keys(object2).length) return false;
    for (const key of keys) if (!areObjectsSame(object1[key], object2[key])) return false;

    return true;
}

/**
 * If the given value evaluates to "true", "True" or any variation there of, returns true, else false.
 * @param {string||object} value The value to check
 * @returns If the given value evaluates to "true", "True" or any variation there of, returns true, else false.
 */
function parseBoolean(value) {
    if (!value) return false;
    return String(value).toLowerCase() == "true";
}

/**
 * Returns a human readable timestamp
 * @returns Date and time as a string
 */
function getDateTime() {

    const date = new Date();

    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    let min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    let sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    const year = date.getFullYear();

    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    let day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return `${year}:${month}:${day}:${hour}:${min}:${sec}`;
}

/**
 * Returns the current timestamp in nano seconds
 * @returns Timestamp in nano seconds
 */
function getTimeStamp() {
    const hrTime = process.hrtime();
    return hrTime[0] * 1000000000 + hrTime[1];
}

/**
 * Returns the nested value inside an object
 * @param {*} path The path to the value in dot(.) notation
 * @param {*} objToCheck The object
 * @param {*} separator The seperator, usually "."
 * @returns The value if found, or undefined if no such value exits.
 */
function getObjectValue(path, objToCheck, separator='.') { 
    const properties = Array.isArray(path) ? path : path.split(separator)
    let currentObject = objToCheck; for (const property of properties) {
        if (!currentObject[property]) return undefined; 
        else currentObject = currentObject[property];
    }
    return currentObject;
}

/**
 * Takes in an object array, and returns the same array, but objects stringified using
 * JSON.stringify (i.e. converts the array's members to strings)
 * @param {Array} array An array of objects, or a single object
 * @returns The same array, but objects stringified using JSON.stringify
 */
function flattenObjArray(array) {
    if (!Array.isArray(array)) array = [array];
    const flatArray = []; for (const object of array) { 
        if (!(object instanceof Object)) flatArray.push(object); else {
            const flatObj = {}; for (const key in object) flatObj[key] = 
                typeof object[key] == "string" ? object[key] :
                Array.isArray(object[key]) ? flattenObjArray(object[key]) : 
                object[key] instanceof Object ? JSON.stringify(object[key]) : object[key];
            flatArray.push(flatObj); 
        }
    }
    return flatArray;
}

/**
 * If the given string is a valid Javascript code (no syntax errors) returns
 * it as is, else coverts it to an expression which returns the same code as string
 * @param {string} stringOrExpression String which is possibly code or possibly just a string
 * @returns A valid javascript RHS expression for the given string or code
 */
function getAsJSExpression(stringOrExpression) {
    let isValidJSSyntax = false; try {new Function(stringOrExpression); isValidJSSyntax = true;} catch (err) {};
    if (isValidJSSyntax) return stringOrExpression;
    else return `${JSON.stringify(stringOrExpression)}`;    // send it back as a string expression
}

module.exports = { parseBoolean, getDateTime, getTimeStamp, areObjectsSame, getObjectValue, requireAsync, isValidURI, flattenObjArray, getAsJSExpression };