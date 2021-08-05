/** 
 * Utils for Monkruls
 * URI RE is from https://github.com/jhermsmeier/uri.regex/blob/master/pattern.js
 * (C) 2020 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 */
const vm = require("vm");
const fspromises = require("fs").promises;
const URI_REG_EXP = new RegExp( "([A-Za-z][A-Za-z0-9+\\-.]*):(?:(//)(?:((?:[A-Za-z0-9\\-._~!$&'()*+,;=:]|%[0-9A-Fa-f]{2})*)@)?((?:\\[(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|::(?:[0-9A-Fa-f]{1,4}:){5}|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::)(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)|[Vv][0-9A-Fa-f]+\\.[A-Za-z0-9\\-._~!$&'()*+,;=:]+)\\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[A-Za-z0-9\\-._~!$&'()*+,;=]|%[0-9A-Fa-f]{2})*))(?::([0-9]*))?((?:/(?:[A-Za-z0-9\\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)|/((?:(?:[A-Za-z0-9\\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:/(?:[A-Za-z0-9\\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)?)|((?:[A-Za-z0-9\\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:/(?:[A-Za-z0-9\\-._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)|)(?:\\?((?:[A-Za-z0-9\\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*))?(?:\\#((?:[A-Za-z0-9\\-._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*))?" );

const isValidURI = toCheck => toCheck.match(URI_REG_EXP) != null;

const requireAsync = async function (module, moduleIsPath) {
    const data = moduleIsPath?await fspromises.readFile(module, "utf8"):module;
    const sandbox = {module: {exports: {}}};
    const code = `(function (module) {exports=module.exports;${data}})(module)`;
    vm.runInNewContext(code, sandbox);
    return sandbox.module.exports;
}

function areObjectsSame(object1, object2) {
    if (typeof object1 != typeof object2) return false; 
    if ((object1 && !object2) || (!object1 && object2)) return false; if (!object1 && !object2) return true;
    if (typeof object1 != "object") return object1 == object2;
    
    const keys = Object.keys(object1); if (keys.length != Object.keys(object2).length) return false;
    for (const key of keys) if (!areObjectsSame(object1[key], object2[key])) return false;

    return true;
}

function parseBoolean(value) {
    if (!value) return false;
    return String(value).toLowerCase() == "true";
}

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

function getTimeStamp() {
    const hrTime = process.hrtime();
    return hrTime[0] * 1000000000 + hrTime[1];
}

function getObjectValue(path, objToCheck, separator='.') { 
    const properties = Array.isArray(path) ? path : path.split(separator)
    let currentObject = objToCheck; for (const property of properties) {
        if (!currentObject[property]) return undefined; 
        else currentObject = currentObject[property];
    }
    return currentObject;
}

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

module.exports = { parseBoolean, getDateTime, getTimeStamp, areObjectsSame, getObjectValue, requireAsync, isValidURI, flattenObjArray };
