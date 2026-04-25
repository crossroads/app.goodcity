#!/usr/bin/env node

const { execSync, spawnSync } = require("child_process");

function sh(cmd) {
  try {
    return execSync(cmd, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (e) {
    e._shCmd = cmd;
    throw e;
  }
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

function logExecSyncFailure(e) {
  if (e.code === "ENOENT") {
    console.error(
      "adb not found on PATH; install Android Platform Tools or add adb to PATH."
    );
    return;
  }
  const cmd = e._shCmd ? ` (${e._shCmd})` : "";
  const meta =
    e.status != null || e.signal
      ? ` [exit ${e.status}, signal ${e.signal || "none"}]`
      : "";
  console.error(`adb command failed${cmd}${meta}: ${e.message || String(e)}`);
  let stderr =
    typeof e.stderr === "string"
      ? e.stderr
      : e.stderr && typeof e.stderr.toString === "function"
      ? e.stderr.toString("utf8")
      : "";
  let stdout =
    typeof e.stdout === "string"
      ? e.stdout
      : e.stdout && typeof e.stdout.toString === "function"
      ? e.stdout.toString("utf8")
      : "";
  if (!stderr && !stdout && Array.isArray(e.output)) {
    const o0 = e.output[0];
    const o1 = e.output[1];
    stdout = o0 && typeof o0.toString === "function" ? o0.toString("utf8") : "";
    stderr = o1 && typeof o1.toString === "function" ? o1.toString("utf8") : "";
  }
  if (stderr.trim()) {
    console.error("stderr:", stderr.trim());
  }
  if (stdout.trim()) {
    console.error("stdout:", stdout.trim());
  }
}

let target;
try {
  target = pickDefaultAndroidTarget();
} catch (e) {
  logExecSyncFailure(e);
  process.exit(1);
}

if (!target) {
  console.error("No running Android emulator/device found via `adb devices`.");
  console.error(
    "Start an emulator (Android Studio Device Manager) and try again."
  );
  process.exit(1);
}

console.log(`Using Android target: ${target}`);
const result = spawnSync("npx", ["cap", "run", "android", "--target", target], {
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error);
  process.exitCode = 1;
} else if (result.signal) {
  console.error(`cap run android exited via signal: ${result.signal}`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status === null ? 1 : result.status;
}
