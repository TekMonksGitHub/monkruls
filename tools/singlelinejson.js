/** 
 * Prints a file removing line feeds.
 * (C) 2021 TekMonks. All rights reserved.
 */
const fs = require("fs");

if (require.main === module) {
    process.argv.splice(0, 2); if (process.argv.length == 0) {
        console.error("Usage: singlelinejson <path to file>");
        process.exit(1);
    } else try { 
        const fileContents = fs.readFileSync(process.argv[0], "utf8");
        console.log(JSON.stringify(JSON.parse(fileContents)));
    } catch (err) {console.log(`Error: ${err}`);process.exit(1);}
}