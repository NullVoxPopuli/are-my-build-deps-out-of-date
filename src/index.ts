import { readJSONSync } from './fs.ts';
import latestVersion from 'latest-version';
import { Walker } from './walker.ts';
import semver from 'semver';
import { styleText } from 'node:util';


const KNOWN_BUILD_PREFIXES = [`@rollup/`, `@babel/`, `@vite/`, `babel-plugin-`, `rollup-plugin-`, `vite-plugin-`];
const KNOWN_BUILD_DEPS = `
  # Vanilla JS
  rollup
  vite
  webpack
  typescript

  # From the Ember Ecosystem
  ember-cli
  ember-cli-babel
  ember-cli-htmlbars
  ember-auto-import
  babel-plugin-ember-template-compilation
  @embroider/addon-dev
  @embroider/macros
  @embroider/shared-internals
  @embroider/core
  @embroider/compat


`.split('\n').map(x => x.trim()).filter(x => !x.startsWith('#')).filter(Boolean);


let walker = new Walker();

await walker.scan();

console.log(`Found ${walker.seenDependencies.size} total dependencies`);

let toCheck: [name: string, version: string][] = [];

for (let [packageJsonPath, version] of walker.seenDependencies) {
  let manifest = readJSONSync(packageJsonPath);

  let name = manifest.name;

  if (!name) continue;

  if (KNOWN_BUILD_DEPS.includes(name)) {
    toCheck.push([name, version]);
    continue;
  }

  if (KNOWN_BUILD_PREFIXES.some(x => name.startsWith(x))) {
    toCheck.push([name, version]);
    continue;
  }
}


let latestVersions = {};

for (let [dep] of toCheck) {
  let latest = await latestVersion(dep);

  latestVersions[dep] = latest;
}


let hasOld = false;

for (let [dep, version] of toCheck) {
  let latest = latestVersions[dep];
  let isOld = semver.lt(version, latest);

  if (isOld) {
    hasOld = true;
    console.log(`Your dep graph contains ${styleText('yellow', dep)} @ ${styleText('red', version)}, but the latest version is ${styleText('green', latest)}`);
  }
}






if (!hasOld) {
  console.log(styleText('green', `Congrats, all your build deps are up to date across your dep graph`));
}
