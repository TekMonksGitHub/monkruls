/**
 * Custom functions examples
 * (C)  2020 TekMonks. All rights reserved.
 */

exports.average = function(array) {
    if (!Array.isArray(array)) return isNaN(parseInt(array, 10))?0:parseInt(array, 10);
    return array.reduce((sum, value) => (isNaN(parseInt(sum,10))?0:parseInt(sum,10)) + (isNaN(parseInt(value,10))?0:parseInt(value,10))) / array.length;
}