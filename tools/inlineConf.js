/** 
 * Inlines the any conf extensions which can be inlined
 * (C) 2021 TekMonks. All rights reserved.
 */
const fs = require("fs");
const mustache = require("mustache");
const utils = require(`${__dirname}/../lib/utils.js`);
const CONSTANTS = require(`${__dirname}/../lib/constants.js`);

if (require.main === module) {
    process.argv.splice(0, 2); if (process.argv.length == 0) {
        console.error("Usage: inlineConf <path to conf file> [output file]");
        process.exit(1);
    }
    const inlineableConf = process.argv[0], outFile = process.argv[1]?process.argv[1]:undefined;

    const confIn = require(inlineableConf);
    const confOut = []; for (const confEntry of confIn) {
        let confEntryTest = mustache.render(confEntry, {rootdir: CONSTANTS.ROOTDIR});
        if (utils.isValidURI(confEntryTest)) confOut.push(fs.readFileSync(confEntryTest, "utf8"));
        else confOut.push(confEntry);
    }
    if (outFile) fs.writeFileSync(outFile, JSON.stringify(confOut)); else console.log(JSON.stringify(confOut));
}