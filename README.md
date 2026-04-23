# GoodCity DONOR App

[![Circle CI](https://circleci.com/gh/crossroads/app.goodcity.svg?style=svg)](https://circleci.com/gh/crossroads/app.goodcity)
[![Code Climate](https://codeclimate.com/github/crossroads/app.goodcity/badges/gpa.svg)](https://codeclimate.com/github/crossroads/app.goodcity)
[![Issue Count](https://codeclimate.com/github/crossroads/app.goodcity/badges/issue_count.svg)](https://codeclimate.com/github/crossroads/app.goodcity)
[![Test Coverage](https://codeclimate.com/github/crossroads/app.goodcity/badges/coverage.svg)](https://codeclimate.com/github/crossroads/app.goodcity)

The GoodCity initiative is a new way to donate quality goods in Hong Kong. See https://www.goodcity.hk for more details.

## Installation

This repo uses two Node versions:

- Node **22** for the legacy Ember app (root project)
- Node **22** for the Capacitor wrapper (`./capacitor/`)

Install and configure Node using NVM: https://github.com/creationix/nvm#install-script

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
ENVIRONMENT=production yarn run ember build --environment=production

# staging (great to get instant test data if not developing API locally)
ENVIRONMENT=staging yarn run ember build --environment=production
```

## Mobile builds (Capacitor)

CircleCI will automatically build apps for `master` and `live` branches. However, if you wish to do this manually you can use the following commands.

- Switch your `shared.goodcity` folder to the correct branch (usually `master` or `live`)
- Build the Ember app, then sync the web assets into the native projects via Capacitor

```shell
# For mobile builds, it's often useful to point at api-staging.goodcity.hk for test data
ENVIRONMENT=staging yarn run ember build --environment=production

cd capacitor
nvm use
yarn install --frozen-lockfile
ENVIRONMENT=staging yarn run rename:package
npx cap sync

# Open native IDEs
npx cap open android
npx cap open ios
```

## Upgrading Capacitor

Review the Capacitor upgrade guide for breaking changes, then update the Capacitor wrapper dependencies and resync native projects.

```shell
cd capacitor
nvm use
yarn install --frozen-lockfile
npx cap sync
```

## Android Studio

If you want to run the app on a debug mobile device, you can use Android Studio to run the gradle builds and push to your development phone.

- Open Android Studio with the project folder located at `<project root>/capacitor/android`
- Connect your mobile phone and turn on debug mode
- Run the usual gradle refresh and build processes
- Use **JDK 17+** for Gradle/Android Gradle Plugin 8.7.x (Android Studio: set the Gradle JDK to 17 in Settings)
- Once the app is launched on the phone, you will have useful logs (great for Push Notification debugging) inside Android Studio and you can also open Browser Inspector to view the usual processes: `edge://inspect/#devices`

## Using WSL2 in Windows

You can run Android Studio in Windows and install the necessary node packages to make it possible to build the Capacitor Android app.

- Install Android Studio
- Install NPM for Windows
- Install windows-build-tools to get python, VS Studio runtimes, .NET 2 SDKs etc

```
nvm install 22
npm install -g production windows-build-tools
```

Open a PowerShell in Administrator mode and run the following commands to assist with setting the Node environment.

```powershell
Add-MpPreference -ExclusionPath ([System.Environment]::ExpandEnvironmentVariables("%APPDATA%\npm\"))
Add-MpPreference -ExclusionPath (Get-ItemProperty "HKLM:SOFTWARE\Node.js" | Select-Object -Property InstallPath)
```
