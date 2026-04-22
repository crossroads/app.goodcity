// Keeps Capacitor ids/names/versions in sync with the root app.goodcity package.json
//
// Sets:
// - Capacitor appId/appName (capacitor.config.json)
// - Android applicationId/namespace (already static) + versionCode/versionName (android/app/build.gradle)
// - iOS bundle id + MARKETING_VERSION + CURRENT_PROJECT_VERSION (ios/App/App.xcodeproj/project.pbxproj)
// - iOS display name (ios/App/App/Info.plist)
//
// ENVIRONMENT VARIABLES
//   ENVIRONMENT = staging | production (required; no default — invalid/missing values exit non-zero)
//   CIRCLE_BUILD_NUM = <numeric> (optional; used for Android versionCode + iOS CFBundleVersion)
//
const fs = require("fs");
const path = require("path");

const ANDROID_BUILD_VERSION_SEED = 270000000;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function cloneRegExp(re) {
  return new RegExp(re.source, re.flags);
}

// Fail fast if a replacement didn't apply, but allow idempotent reruns when the
// file already contains the intended final value.
function replaceRequired(contents, filePath, label, pattern, replacement) {
  const before = contents;
  const hasMatch = cloneRegExp(pattern).test(before);
  const next = before.replace(pattern, replacement);

  if (next === before) {
    if (hasMatch) {
      const matched = cloneRegExp(pattern).exec(before);
      const matchedText = matched && matched[0] ? matched[0] : null;
      if (matchedText && matchedText === replacement) {
        return next;
      }
    } else if (next.includes(replacement)) {
      return next;
    }
    fail(
      `rename_package: failed applying "${label}" in ${filePath}: output was unchanged (hasMatch=${hasMatch})`
    );
  }

  return next;
}

const rawEnvironment = process.env.ENVIRONMENT;
if (rawEnvironment == null || String(rawEnvironment).trim() === "") {
  fail(
    "rename_package: ENVIRONMENT is required. Set ENVIRONMENT=staging or ENVIRONMENT=production."
  );
}
const environment = String(rawEnvironment).trim();
if (environment !== "production" && environment !== "staging") {
  fail(
    `rename_package: ENVIRONMENT must be "staging" or "production" (received "${environment}").`
  );
}
const staging = environment === "staging";

const circleBuildNum = parseInt(process.env.CIRCLE_BUILD_NUM || "", 10);
const hasBuildNum = !isNaN(circleBuildNum);

const rootPkgPath = path.resolve(__dirname, "..", "package.json");
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf8"));
const appVersion = rootPkg.version || "0.0.0";

const appId = staging ? "hk.goodcity.appstaging" : "hk.goodcity.app";
const appName = staging ? "S. GoodCity" : "GoodCity";

// --- capacitor.config.json ---
const capConfigPath = path.join(__dirname, "capacitor.config.json");
const capConfig = JSON.parse(fs.readFileSync(capConfigPath, "utf8"));
capConfig.appId = appId;
capConfig.appName = appName;
fs.writeFileSync(capConfigPath, JSON.stringify(capConfig, null, 2) + "\n");

// --- Android: android/app/build.gradle ---
const androidGradlePath = path.join(
  __dirname,
  "android",
  "app",
  "build.gradle"
);
let androidGradle = fs.readFileSync(androidGradlePath, "utf8");

androidGradle = replaceRequired(
  androidGradle,
  androidGradlePath,
  "Android applicationId",
  /applicationId\s+"[^"]*"/,
  `applicationId "${appId}"`
);

androidGradle = replaceRequired(
  androidGradle,
  androidGradlePath,
  "Android namespace",
  /namespace\s+"[^"]*"/,
  `namespace "${appId}"`
);

androidGradle = replaceRequired(
  androidGradle,
  androidGradlePath,
  "Android versionName",
  /versionName\s+"[^"]*"/,
  `versionName "${appVersion}"`
);

if (hasBuildNum) {
  const versionCode = ANDROID_BUILD_VERSION_SEED + circleBuildNum;
  androidGradle = replaceRequired(
    androidGradle,
    androidGradlePath,
    "Android versionCode",
    /versionCode\s+\d+/,
    `versionCode ${versionCode}`
  );
}

fs.writeFileSync(androidGradlePath, androidGradle);

// --- Android: resources strings.xml (package_name + custom_url_scheme) ---
const androidStringsPath = path.join(
  __dirname,
  "android",
  "app",
  "src",
  "main",
  "res",
  "values",
  "strings.xml"
);
let androidStrings = fs.readFileSync(androidStringsPath, "utf8");
androidStrings = replaceRequired(
  androidStrings,
  androidStringsPath,
  "Android strings.xml package_name",
  /<string name="package_name">[^<]*<\/string>/,
  `<string name="package_name">${appId}</string>`
);
androidStrings = replaceRequired(
  androidStrings,
  androidStringsPath,
  "Android strings.xml custom_url_scheme",
  /<string name="custom_url_scheme">[^<]*<\/string>/,
  `<string name="custom_url_scheme">${appId}</string>`
);
fs.writeFileSync(androidStringsPath, androidStrings);

// --- iOS: project.pbxproj ---
const pbxprojPath = path.join(
  __dirname,
  "ios",
  "App",
  "App.xcodeproj",
  "project.pbxproj"
);
let pbxproj = fs.readFileSync(pbxprojPath, "utf8");

pbxproj = replaceRequired(
  pbxproj,
  pbxprojPath,
  "iOS MARKETING_VERSION",
  /MARKETING_VERSION = [^;]+;/g,
  `MARKETING_VERSION = ${appVersion};`
);

if (hasBuildNum) {
  pbxproj = replaceRequired(
    pbxproj,
    pbxprojPath,
    "iOS CURRENT_PROJECT_VERSION",
    /CURRENT_PROJECT_VERSION = [^;]+;/g,
    `CURRENT_PROJECT_VERSION = ${circleBuildNum};`
  );
}

pbxproj = replaceRequired(
  pbxproj,
  pbxprojPath,
  "iOS PRODUCT_BUNDLE_IDENTIFIER",
  /PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g,
  `PRODUCT_BUNDLE_IDENTIFIER = ${appId};`
);

fs.writeFileSync(pbxprojPath, pbxproj);

// --- iOS: Info.plist display name ---
const infoPlistPath = path.join(__dirname, "ios", "App", "App", "Info.plist");
let infoPlist = fs.readFileSync(infoPlistPath, "utf8");
infoPlist = replaceRequired(
  infoPlist,
  infoPlistPath,
  "iOS Info.plist CFBundleDisplayName",
  /<key>CFBundleDisplayName<\/key>\s*<string>[^<]*<\/string>/m,
  `<key>CFBundleDisplayName</key>\n        <string>${appName}</string>`
);
fs.writeFileSync(infoPlistPath, infoPlist);

console.log(`Set app id: ${appId}`);
console.log(`Set app name: ${appName}`);
console.log(`Set app version: ${appVersion}`);
if (hasBuildNum) {
  console.log(
    `Set Android version code: ${ANDROID_BUILD_VERSION_SEED + circleBuildNum}`
  );
  console.log(`Set iOS bundle version: ${circleBuildNum}`);
}
