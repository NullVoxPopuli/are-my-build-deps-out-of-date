import { dirname } from "node:path";

import resolvePackagePath from "resolve-package-path";

import { readJSONSync } from "./fs.ts";
import { findRoot } from "@manypkg/find-root";

export class Walker {
  private packageResolveCache = {
    PATH: new Map(),
    RESOLVED_PACKAGE_PATH: new Map(),
    REAL_FILE_PATH: new Map(),
    REAL_DIRECTORY_PATH: new Map(),
  };

  private seen = new Map<string, string>();

  get seenDependencies() {
    return this.seen;
  }

  edges = 0;
  get count() {
    return this.seen.size;
  }

  repos = 1;

  async scan() {
    const dir = await findRoot(process.cwd());
    const monorepoInfo = await dir.tool.getPackages(dir.rootDir);

    const all = new Set(
      [monorepoInfo.rootPackage, ...monorepoInfo.packages]
        .map((x) => x?.relativeDir)
        .filter(Boolean)
        .map((x) => x + "/package.json"),
    );

    this.repos = all.size;

    for (let entry of all) {
      this.traverse(entry);
    }
  }

  traverse(packageJSONPath: string): string {
    let version = this.seen.get(packageJSONPath);
    if (version) {
      return version;
    }

    let pkg = readJSONSync(packageJSONPath);
    this.seen.set(packageJSONPath, pkg.version);

    let root = dirname(packageJSONPath);

    this.checkSection("dependencies", pkg, root);
    this.checkSection("peerDependencies", pkg, root);
    this.checkSection("devDependencies", pkg, root);

    return pkg.version;
  }

  private checkSection(
    section: "dependencies" | "devDependencies" | "peerDependencies",
    pkg: any,
    packageRoot: string,
  ): void {
    let dependencies = pkg[section];
    if (!dependencies) {
      return;
    }
    for (let name of Object.keys(dependencies)) {
      this.checkDep(packageRoot, name);
      this.edges++;
    }
  }

  private checkDep(packageRoot: string, pkgName: string): string | false {
    let target = resolvePackagePath(
      pkgName,
      packageRoot,
      this.packageResolveCache,
    );
    if (!target) {
      return false;
    }
    return this.traverse(target);
  }
}
