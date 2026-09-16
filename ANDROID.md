# 🤖 Android Build & Emulation Setup

This guide walks through setting up Android app builds and device emulation for
`app.goodcity` when developing inside **WSL2** with an **Android emulator running on
Windows 11**. It covers SDK installation on both sides, the Cordova build commands, and
how to deploy and debug the built APK against the Windows-hosted emulator from WSL.

> 🪟 = run on **Windows 11** 🐧 = run in **WSL**

---

## 1. 🪟 Prepare Windows 11 for Android Device Emulation

1. Install **Android Studio**.
2. In Android Studio: `File → Settings → Languages & Frameworks → Android SDK`.
3. Install the correct SDK version (**36**) and the following SDK tools:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Command-line Tools
   - ✅ Android Emulator (download a **Pixel 8** image)
4. Create a new empty project in Android Studio — this is just so you can reach the top
   menu bar's `Tools → Device Manager` later.

---

## 2. 🐧 Prepare WSL for Android Builds

Reference: [this gist comment](https://gist.github.com/jjvillavicencio/18feb09f0e93e017a861678bc638dcb0?permalink_comment_id=5838107#gistcomment-5838107)

```bash
mkdir -p ~/Android
cd ~/Android
wget https://dl.google.com/android/repository/commandlinetools-linux-15859902_latest.zip
unzip commandlinetools-linux-15859902_latest.zip
rm commandlinetools-linux-15859902_latest.zip
mv cmdline-tools/ latest
mkdir cmdline-tools
mv latest/ cmdline-tools/
```

Add the following to `~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Android
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Then reload and install the SDK packages:

```bash
source ~/.bashrc

sdkmanager --install "platform-tools" "platforms;android-36" "build-tools;36.1.0"
yes | sdkmanager --licenses
```

---

## 3. 🐧 Cordova Build Commands

Run from the project root:

```bash
EMBER_CLI_CORDOVA=1 ENVIRONMENT=staging yarn run ember build --environment=production
cd cordova
```

> ⚠️ Before building, ensure `google-services.json` is in the `cordova` root directory
> and that `cordova/www` links to `dist`.

```bash
sudo apt install openjdk-17-jdk
sudo apt install gradle
npm install cordova@13
yarn cordova platform add android
yarn cordova build android --debug --device
```

---

## 4. 🔀 Debug in the Android Emulator (WSL ↔ Windows 11)

🐧 Alias `adb` to the Windows-side binary so WSL can talk to the Windows emulator:

```bash
alias adb='/mnt/c/Users/USERNAME/AppData/Local/Android/Sdk/platform-tools/adb.exe'
```

🪟 On Windows 11:

1. Open the blank project created in [step 1](#1--prepare-windows-11-for-android-device-emulation).
2. Menu: `Tools → Device Manager`.
3. Run the **Pixel 8** device.

🐧 Back in WSL, confirm the device is visible:

```bash
adb devices
```

Install the built APK onto the emulator:

```bash
adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk
adb uninstall hk.goodcity.appstaging # if needing to uninstall first
```
