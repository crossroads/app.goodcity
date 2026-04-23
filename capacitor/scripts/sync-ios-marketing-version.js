#!/usr/bin/env node
/**
 * Sets MARKETING_VERSION in the iOS Xcode project from the Ember app root
 * package.json ("version"), so it stays aligned with releases.
 */
const fs = require("fs");
const path = require("path");

const capacitorRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(capacitorRoot, "..");
const pkgPath = path.join(repoRoot, "package.json");
const pbxPath = path.join(
  capacitorRoot,
  "ios",
  "App",
  "App.xcodeproj",
  "project.pbxproj"
);

const version = JSON.parse(fs.readFileSync(pkgPath, "utf8")).version;
if (!version || typeof version !== "string") {
  console.error(
    "sync-ios-marketing-version: missing string version in",
    pkgPath
  );
  process.exit(1);
}

let pbx = fs.readFileSync(pbxPath, "utf8");
const next = pbx.replace(
  /MARKETING_VERSION = [^;]+;/g,
  `MARKETING_VERSION = ${version};`
);
if (next !== pbx) {
  fs.writeFileSync(pbxPath, next);
  console.log(
    "sync-ios-marketing-version: set MARKETING_VERSION to",
    version,
    "in project.pbxproj"
  );
}
