#!/usr/bin/env node

const { execSync } = require("child_process");

function sh(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString("utf8");
}

function pickDefaultAndroidTarget() {
  const out = sh("adb devices");
  const lines = out
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .filter(l => !l.toLowerCase().startsWith("list of devices attached"));

  // Prefer an emulator (emulator-5554), otherwise any connected device.
  const devices = lines
    .map(l => l.split(/\s+/))
    .filter(([serial, state]) => serial && state === "device")
    .map(([serial]) => serial);

  const emulator = devices.find(d => d.startsWith("emulator-"));
  return emulator || devices[0] || null;
}

const target = pickDefaultAndroidTarget();
if (!target) {
  console.error("No running Android emulator/device found via `adb devices`.");
  console.error(
    "Start an emulator (Android Studio Device Manager) and try again."
  );
  process.exit(1);
}

console.log(`Using Android target: ${target}`);
process.exitCode = require("child_process").spawnSync(
  "npx",
  ["cap", "run", "android", "--target", target],
  { stdio: "inherit" }
).status;
