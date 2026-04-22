// Keeps Capacitor ids/names/versions in sync with the root app.goodcity package.json
//
// Sets:
// - Capacitor appId/appName (capacitor.config.json)
// - Android applicationId/namespace (already static) + versionCode/versionName (android/app/build.gradle)
// - iOS bundle id + MARKETING_VERSION + CURRENT_PROJECT_VERSION (ios/App/App.xcodeproj/project.pbxproj)
// - iOS display name (ios/App/App/Info.plist)
//
// ENVIRONMENT VARIABLES
//   ENVIRONMENT = (staging|production)
//   CIRCLE_BUILD_NUM = <numeric> (optional; used for Android versionCode + iOS CFBundleVersion)
//
const fs = require("fs");
const path = require("path");

const ANDROID_BUILD_VERSION_SEED = 270000000;

const environment = process.env.ENVIRONMENT || "development";
const staging = environment !== "production";

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

androidGradle = androidGradle.replace(
  /applicationId\s+"[^"]*"/,
  `applicationId "${appId}"`
);

androidGradle = androidGradle.replace(
  /namespace\s+"[^"]*"/,
  `namespace "${appId}"`
);

androidGradle = androidGradle.replace(
  /versionName\s+"[^"]*"/,
  `versionName "${appVersion}"`
);

if (hasBuildNum) {
  const versionCode = ANDROID_BUILD_VERSION_SEED + circleBuildNum;
  androidGradle = androidGradle.replace(
    /versionCode\s+\d+/,
    `versionCode ${versionCode}`
  );
}

fs.writeFileSync(androidGradlePath, androidGradle);

// --- iOS: project.pbxproj ---
const pbxprojPath = path.join(
  __dirname,
  "ios",
  "App",
  "App.xcodeproj",
  "project.pbxproj"
);
let pbxproj = fs.readFileSync(pbxprojPath, "utf8");

pbxproj = pbxproj.replace(
  /MARKETING_VERSION = [^;]+;/g,
  `MARKETING_VERSION = ${appVersion};`
);

if (hasBuildNum) {
  pbxproj = pbxproj.replace(
    /CURRENT_PROJECT_VERSION = [^;]+;/g,
    `CURRENT_PROJECT_VERSION = ${circleBuildNum};`
  );
}

pbxproj = pbxproj.replace(
  /PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g,
  `PRODUCT_BUNDLE_IDENTIFIER = ${appId};`
);

fs.writeFileSync(pbxprojPath, pbxproj);

// --- iOS: Info.plist display name ---
const infoPlistPath = path.join(__dirname, "ios", "App", "App", "Info.plist");
let infoPlist = fs.readFileSync(infoPlistPath, "utf8");
infoPlist = infoPlist.replace(
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
