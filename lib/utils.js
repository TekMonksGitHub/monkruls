/** 
 * (C) 2020 TekMonks. All rights reserved.
 * License: MIT - see enclosed LICENSE file.
 */

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

module.exports = { parseBoolean, getDateTime, getTimeStamp, areObjectsSame, getObjectValue };
