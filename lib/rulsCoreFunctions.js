/** 
 * rulsCoreFunctions.js, Rules core functions for the engine
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */

exports.intersect = function() {
    if (arguments.length == 0) return [];    // no intersection possible
    
    let result = [...arguments[0]];
    for (const array of [...arguments].slice(1)) result = result.filter(value => array.includes(value));

    return result;
}

exports.intersect_size = function() {
    return exports.intersect(...arguments).length;
}

exports.union = function() {
    if (arguments.length == 0) return [];    // no union possible
    
    const result = [...arguments[0]];
    for (const array of [...arguments].slice(1)) for (const element of array) if (!result.includes(element)) result.push(element);

    return result;
}

exports.union_size = function() {
    return exports.union(...arguments).length;
}

exports.object_sum = function(object, keys) {
    let count = 0; for (const key of keys) {
        const value = parseInt(object[key]); count += value?value:0; }
    return count;
}

exports.sum = function() {
    let count = 0; for (const array of [...arguments]) for (const element of array) {
        const value = parseInt(element,10); count += value?value:0; }
    return count;
}

exports.count = array => array?array.length:0;

exports.match_pattern = function(array, pattern) { const regexp = new RegExp(pattern);
    return array.filter(element => element.match(regexp)); }