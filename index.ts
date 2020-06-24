#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as changeCase from "change-case";

function generateImportsExports(dir: string) {
    console.log(dir + ": candidate found.");
    const files = fs.readdirSync(dir).filter((file) => {
        if (file === "index.ts") return false;
        if (file.endsWith(".ts")) return true;
        try {
            let fpath = path.join(dir, file);
            let stat = fs.statSync(fpath);
            if (stat.isDirectory()) {
                let indexStat = fs.statSync(path.join(fpath, "index.ts"));
                return indexStat.isFile();
            } else {
                return false;
            }
        } catch {
            return false;
        }
    });

    console.log(files);

    let builder: string[] = ["// Automatically generated index"];

    if (!files.length) {
        builder.push("export default undefined;");
    } else {
        for (let filename of files) {
            let importName: string;

            if (filename.endsWith(".ts")) importName = filename.substring(0, filename.length - 3);
            else importName = filename;

            builder.push(`export * from "./${importName}";`);
        }
    }

    let indexDest = path.join(dir, "index.ts");
    fs.writeFileSync(indexDest, builder.join("\n"));
    console.log(dir + ": index generated.");
}

function getNewFilename(file: string, templateString: string, replaceWith: string): string {
    let filename = path.basename(file);

    let teststr = changeCase.constantCase(templateString);
    if (filename.includes(teststr)) {
        return filename.replace(teststr, changeCase.constantCase(replaceWith));
    }
    teststr = changeCase.snakeCase(templateString);
    if (filename.includes(teststr)) {
        return filename.replace(teststr, changeCase.snakeCase(replaceWith));
    }
    teststr = changeCase.camelCase(templateString);
    if (filename.includes(teststr)) {
        return filename.replace(teststr, changeCase.camelCase(replaceWith));
    }
    teststr = changeCase.pascalCase(templateString);
    if (filename.includes(teststr)) {
        return filename.replace(teststr, changeCase.pascalCase(replaceWith));
    }
    return null;
}

function renameFile(file: string, templateString: string, replaceWith: string) {
    let filename = getNewFilename(file, templateString, replaceWith);
    if (filename) fs.renameSync(file, path.join(path.dirname(file), filename));
}

export default function crawl(root: string, templateString: string, replaceWith: string) {
    const files = fs.readdirSync(root);

    for (let file of files) {
        try {
            let stat = fs.statSync(path.join(root, file));
            if (stat.isDirectory()) crawl(path.join(root, file), templateString, replaceWith);
            renameFile(path.join(root, file), templateString, replaceWith);
        } catch {}
    }
}

// let root: string = process.argv.length >= 3 ? process.argv[2] : ".";
// let flagName: string = process.argv.length >= 4 ? process.argv[3] : ".auto-index";
// console.log(`Starting index generation with root: ${root} and flag name: ${flagName}.`);
crawl("./test", "templateStr", "patate_sautee");
