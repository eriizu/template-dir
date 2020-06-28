#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as changeCase from "change-case";

// Would be way better off if there was some kind of array for matching and replacing patterns.
function getNewFilename(file: string, templateString: string, replaceWith: string): string {
    let filename = path.basename(file);

    let teststr = changeCase.constantCase(templateString);
    while (filename.includes(teststr)) {
        filename = filename.replace(teststr, changeCase.constantCase(replaceWith));
    }
    teststr = changeCase.snakeCase(templateString);
    while (filename.includes(teststr)) {
        filename = filename.replace(teststr, changeCase.snakeCase(replaceWith));
    }
    teststr = changeCase.camelCase(templateString);
    while (filename.includes(teststr)) {
        filename = filename.replace(teststr, changeCase.camelCase(replaceWith));
    }
    teststr = changeCase.pascalCase(templateString);
    while (filename.includes(teststr)) {
        filename = filename.replace(teststr, changeCase.pascalCase(replaceWith));
    }
    return filename == path.basename(file) ? null : filename;
}

function renameFile(file: string, templateString: string, replaceWith: string) {
    let filename = getNewFilename(file, templateString, replaceWith);
    if (filename) fs.renameSync(file, path.join(path.dirname(file), filename));
}

function transformFile(file: string, templateString: string, replaceWith: string) {
    const data = fs.readFileSync(file);
    const updatedContents = getNewFilename(data.toString(), templateString, replaceWith);

    if (updatedContents) {
        const fd = fs.openSync(file, "r+");
        fs.writeSync(fd, updatedContents);
    }
}

export default function crawl(root: string, templateString: string, replaceWith: string) {
    const files = fs.readdirSync(root);

    for (let file of files) {
        try {
            let stat = fs.statSync(path.join(root, file));
            if (stat.isDirectory()) crawl(path.join(root, file), templateString, replaceWith);
            if (stat.isFile()) transformFile(path.join(root, file), templateString, replaceWith);
            renameFile(path.join(root, file), templateString, replaceWith);
        } catch (err) {
            console.error("Error while processing: " + file);
            console.error(err);
        }
    }
}

if (process.argv.length < 5) {
    console.log(
        "usage: " +
            process.argv0 +
            "[root directory to crawl in] [template string to replace] [string with which to replace]"
    );
    process.exit(1);
}
let root = process.argv[2];
let templateStr = process.argv[3];
let replaceWith = process.argv[4];
// console.log(`Starting index generation with root: ${root} and flag name: ${flagName}.`);
crawl(root, templateStr, replaceWith);
