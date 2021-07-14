/**
 * Sample custom functions module
 * (C)  2020 TekMonks. All rights reserved.
 */

exports.caseInsensitiveIsNotEqual = function(str1,str2) {
    return str1.toLowerCase() != str2.toLowerCase();
}