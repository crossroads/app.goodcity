# GoodCity DONOR App

[![Circle CI](https://circleci.com/gh/crossroads/app.goodcity.svg?style=svg)](https://circleci.com/gh/crossroads/app.goodcity)
[![Code Climate](https://codeclimate.com/github/crossroads/app.goodcity/badges/gpa.svg)](https://codeclimate.com/github/crossroads/app.goodcity)
[![Issue Count](https://codeclimate.com/github/crossroads/app.goodcity/badges/issue_count.svg)](https://codeclimate.com/github/crossroads/app.goodcity)
[![Test Coverage](https://codeclimate.com/github/crossroads/app.goodcity/badges/coverage.svg)](https://codeclimate.com/github/crossroads/app.goodcity)

The GoodCity initiative is a new way to donate quality goods in Hong Kong. See https://www.goodcity.hk for more details.

## Installation

Install and configure NodeJS 12 using NVM: https://github.com/creationix/nvm#install-script

You can clone the GoodCity app repo direct:

```shell
yarn add bower ember-cli phantomjs-prebuilt
git clone https://github.com/crossroads/app.goodcity.git
yarn
bower install
```

Or use the more complicated setup where you link the `shared.goodcity` library also (useful for development):

```shell
git clone https://github.com/crossroads/shared.goodcity.git
cd shared.goodcity
yarn link
cd ..
git clone https://github.com/crossroads/app.goodcity.git
cd app.goodcity
yarn link shared-goodcity
yarn
bower install
```

## Running in development/staging mode

```shell
yarn start            # connects to API server at http://localhost:3000
yarn start:staging    # connects to API server at https://api-staging.goodcity.hk
```

Open a browser at http://localhost:4200

## Running Tests

```shell
# start test server in background
yarn run ember server --port 4200

# then in another window
yarn run ember test
yarn run ember test -f offer
yarn run ember test -f item
```

If you are using WSL2 or headless linux, you can install Google Chrome browser and run the tests inside XVFB (Virtual frame buffer).

```shell
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt-get update
sudo apt-get install -y google-chrome-stable xvfb
```

Prefix the test command with `xvfb-run` which will start/stop the XVFB process and set the DISPLAY env for you.

```shell
# start test server in background
yarn run ember server --port 4200

# in another window
xvfb-run yarn run ember test
```

## Building for Web

```shell
# development
EMBER_CLI_CORDOVA=0 yarn run ember build --environment=production

# staging (great to get instant test data if not developing API locally)
EMBER_CLI_CORDOVA=0 ENVIRONMENT=staging yarn run ember build --environment=production
```

## Cordova builds

CircleCI will automatically build apps for `master` and `live` branches. However, if you wish to do this manually you can use the following commands.

- Switch your admin.goodcity and shared.goodcity folders to the correct branch (usually `master` or `live`)
- Build the ember app, install cordova, add the platform

```shell
# For cordova builds, it's often useful to point at api-staging.goodcity.hk for test data
EMBER_CLI_CORDOVA=1 ENVIRONMENT=staging yarn run ember build --environment=production
ln -s `pwd`/dist `pwd`/cordova/www
cd cordova
# can help to start with a clean env, if android build issues
rm -rf platforms/ plugins/ node_modules/
cordova platform add android@12
# now open Android Studio and build or run gradle in the docker env
```

## Upgrading Cordova

First you will need to review the Cordova blog for changes in new versions of cordova-<platform> and plugins. Then

````shell
cd cordova
nvm use 22
rm -rf node_modules/ platforms/ plugins/
yarn
npm install cordova@12
cordova platform remove android
cordova platform add android@14
cordova platform remove ios
cordova platform add ios@7

## Android Studio

If you want to run the app on a debug mobile device, you can use Android Studio to run the gradle builds and push to your development phone.

- After running `cordova platform add android@14` above, open Android Studio with the project folder located at <project root>/cordova/platforms/android
- Connect your mobile phone and turn on debug mode
- Run the usual gradle refresh and build processes
- Once the app is launched on the phone, you will have useful logs (great for Push Notification debugging) inside Android Studio and you can also open Browser Inspector to view the usual processes: `edge://inspect/#devices`

## Docker environment

We provide `Dockerfile-cordova` as a means to set up an Android / node environment for building the apps. This is based off the same environment we set up to build the Android apps on CircleCI.

To prepare the build environment the first time:

```shell
docker build -f Dockerfile-cordova -t app.goodcity.hk:latest .
EMBER_CLI_CORDOVA=1 ENVIRONMENT=staging yarn run ember build --environment=production
cd cordova/
ENVIRONMENT=staging node rename_package.js
````

Once you have built the Ember project, run the docker build container with mounted folders and run the cordova commands to build for Android.

```
docker run -d -v `pwd`/dist/:/home/circleci/project/dist/ -v `pwd`/cordova:/home/circleci/project/cordova/ -w /home/circleci/project/cordova/ -u root -t app.goodcity.hk:latest /bin/bash
# returns container hash e.g. 812cb3...
docker container exec 812cb3 cordova telemetry off
docker container exec 812cb3 cordova build android --debug --device
docker cp 812cb3:/home/circleci/project/cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk /path/to/store/app
```

To rebuild the app, it's sufficient to delete the app-debug.apk file, rebuild the Ember app (if necessary) and run cordova again. The volume mounts keep the docker container up to date.

```shell
docker container exec 812cb3 rm /home/circleci/project/cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk
EMBER_CLI_CORDOVA=1 ENVIRONMENT=staging yarn run ember build --environment=production
docker container exec 812cb3 cordova build android --debug --device
```

When development has finished, stop and clean up the container

```shell
docker stop 812cb3
docker rm 812cb3
```

## Using WSL2 in Windows

You can run Android Studio in Windows and install the necessary node packages to make it possible to compile the cordova android app.

- Install Android Studio
- Install NPM for Windows
- Install windows-build-tools to get python, VS Studio runtimes, .NET 2 SDKs etc

```
nvm install 10
npm install -g production windows-build-tools
```

Open a PowerShell in Administrator mode and run the following commands to assist with setting the Node environment.

```powershell
Add-MpPreference -ExclusionPath ([System.Environment]::ExpandEnvironmentVariables("%APPDATA%\npm\"))
Add-MpPreference -ExclusionPath (Get-ItemProperty "HKLM:SOFTWARE\Node.js" | Select-Object -Property InstallPath)
```
