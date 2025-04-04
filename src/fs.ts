import { writeFileSync, readFileSync } from "node:fs";

export function readJSONSync(filePath: string) {
  let buffer = readFileSync(filePath);

  return JSON.parse(buffer.toString());
}

export function writeJSONSync(filePath: string, data: any) {
  let str = JSON.stringify(data, null, 2);

  writeFileSync(filePath, str);
}

export function humanPath(path: string) {
  let prefix = process.cwd();
  if (path.startsWith(prefix)) {
    path = path.replace(prefix, ".");
  }

  if (path.includes("/.pnpm/")) {
    let [, relevant] = path.split("/.pnpm/");
    path = `<.pnpm>/${relevant}`;
  }

  return path;
}
