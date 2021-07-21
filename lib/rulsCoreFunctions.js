/** 
 * rulsCoreFunctions.js, Rules core functions for the ruls engine
 * 
 * (C) 2020 TekMonks. All rights reserved.
 */
const utils = require(`${CONSTANTS.LIBDIR}/utils.js`);

/**
 * Inits the module, adds in given additional function modules' functions
 * to the namespace of this module, so that they are available to the rules.
 * @param {array} functionMods Path or code of modules
 */
exports.init = async function(functionMods) {
    for (const functionMod of functionMods) {
        const functionModCodeOrPath = typeof functionMod === "string" ? functionMod : Object.values(functionMod)[0];
        const mod = await utils.requireAsync(functionModCodeOrPath, utils.isValidURI(functionModCodeOrPath));
        for (const key in mod) this[key] = function(){mod[key](...arguments)};
    }
}

/**
 * Returns the intersection of the given arrays, arguments should be array1, array2, ..., array_n
 * @returns The intersection of the given arrays
 */
exports.intersect = function() {
    if (arguments.length == 0) return [];    // no intersection possible
    
    let result = [...arguments[0]];
    for (const array of [...arguments].slice(1)) result = result.filter(value => array.includes(value));

    return result;
}

/**
 * Intersects the given arrays, and returns the size of the intersection array
 * Arguments should be array1, array2, ..., array_n
 * @returns The size of the intersection array
 */
exports.intersect_size = function() {
    return exports.intersect(...arguments).length;
}

/**
 * Returns the union of the given arrays
 * Arguments should be array1, array2, ..., array_n
 * @returns The union of the given arrays
 */
exports.union = function() {
    if (arguments.length == 0) return [];    // no union possible
    
    const result = [...arguments[0]];
    for (const array of [...arguments].slice(1)) for (const element of array) if (!result.includes(element)) result.push(element);

    return result;
}

/**
 * Returns the sizne of the union of the given arrays
 * Arguments should be array1, array2, ..., array_n
 * @returns The size of the union of the given arrays
 */
exports.union_size = function() {
    return exports.union(...arguments).length;
}

/**
 * Sums the given object, where each key's value is a numerical value. 
 * If the key's value is non-numeric then it assumes it is zero.
 * @param {object} object The object to use
 * @param {array} keys The keys to sum
 * @returns The sum of thegiven keys of the object
 */
exports.object_sum = function(object, keys) {
    let count = 0; for (const key of keys) {
        const value = parseInt(object[key]); count += value?value:0; }
    return count;
}

/**
 * Sums the given arguments, caller should call sum(numer1, number2, ..., number_n)
 * @returns The sum of the arguments
 */
exports.sum = function() {
    let count = 0; for (const array of [...arguments]) for (const element of array) {
        const value = parseInt(element,10); count += value?value:0; }
    return count;
}

/**
 * Returns the number of elements inside the given array
 * @param {array} array The array to count
 * @returns The number of elements inside the given array
 */
exports.count = array => array?array.length:0;

/**
 * Returns an array returning sub-elements of the given array which match the given pattern
 * @param {array} array The array 
 * @param {string} pattern The pattern to use to filter
 * @returns An array returning sub-elements of the given array which match the given pattern
 */
exports.match_pattern = function(array, pattern) { const regexp = new RegExp(pattern);
    return array.filter(element => element.match(regexp)); }

/**
 * Return the scalar value of the given property inside the gievn array or object or the value
 * of the global property with the same name.
 * @param {string} property The property name or index
 * @param {object} data The object or array
 * @returns The scalar value of the given property inside the gievn array or object or global variable
 */
exports.valueOf = (property, data) => data?eval(`data.${property}`):eval(property);