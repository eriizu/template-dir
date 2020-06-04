import * as fs from "fs";
import * as path from "path";
export default function requireAll(mod: NodeModule) {
    console.log(mod);
}

export function generateImportsExports(dir: string) {
    const files = fs.readdirSync(dir).filter((file) => {
        if (file.endsWith(".ts")) return true;
        try {
            let fpath = path.join(dir, file);
            let stat = fs.statSync(fpath);
            if (stat.isDirectory()) {
                let indexStat = fs.statSync(path.join(fpath, "index.ts"));
                return indexStat.isFile();
            }
        } catch {
            return false;
        }
    });

    let builder: string[] = ["// Automatically generated index"];

    for (let filename of files) {
        builder.push(`export * from "./${filename.substring(0, filename.length - 3)}";`);
    }

    let indexDest = path.join(dir, "index.ts");
    fs.writeFileSync(indexDest, builder.join("\n"));
}

export function crawl(root: string, flagName: string) {
    // const files = fs.readdirSync(root).filter((file) => file.endsWith(".ts"));
    console.log(root);
    const folders = fs.readdirSync(root).filter((file) => {
        let fpath = path.join(root, file);
        let stat = fs.statSync(fpath);
        if (stat.isDirectory()) {
            return true;
        }
    });

    for (let dir of folders) {
        crawl(path.join(root, dir), flagName);
        try {
            fs.statSync(path.join(root, dir, flagName));
            generateImportsExports(path.join(root, dir));
        } catch {}
    }
}
