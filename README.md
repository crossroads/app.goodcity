# GoodCity Donor App

[![Circle CI](https://circleci.com/gh/crossroads/app.goodcity.svg?style=svg)](https://circleci.com/gh/crossroads/app.goodcity)
[![Code Climate](https://codeclimate.com/github/crossroads/app.goodcity/badges/gpa.svg)](https://codeclimate.com/github/crossroads/app.goodcity)
[![Issue Count](https://codeclimate.com/github/crossroads/app.goodcity/badges/issue_count.svg)](https://codeclimate.com/github/crossroads/app.goodcity)
[![Test Coverage](https://codeclimate.com/github/crossroads/app.goodcity/badges/coverage.svg)](https://codeclimate.com/github/crossroads/app.goodcity)

The donor-facing app for [GoodCity.hk](https://www.goodcity.hk) — a new way to
donate quality goods in Hong Kong, run by the Crossroads Foundation.

Donors photograph and describe items, submit an offer for review by Crossroads
staff, chat with reviewers in-app, then book transport (GoGoVan, a Crossroads
truck, or self drop-off). The same codebase ships as a **web app** and as a
**Cordova-wrapped iOS/Android app**. Available in English and Traditional Chinese.

## Architecture at a glance

This is an [Ember.js](https://emberjs.com) 2.x single-page app. It is deliberately
thin: most models, services and shared screens live in the **`shared.goodcity`**
addon, which it installs from git and shares with the staff app.

| Repo                                                                       | Role                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [api.goodcity](https://github.com/crossroads/api.goodcity)                 | Rails JSON API — the backend this app talks to               |
| [shared.goodcity](https://github.com/crossroads/shared.goodcity)           | Ember addon holding shared models, services and screens      |
| [admin.goodcity](https://github.com/crossroads/admin.goodcity)             | Staff app for reviewing offers (also uses `shared.goodcity`) |
| [socket.io-webservice](https://github.com/crossroads/socket.io-webservice) | Pushes live record updates to connected clients              |

## Prerequisites

- **Node 12** (see `.nvmrc`). The build toolchain is pinned to it and will not
  compile on newer Node. Install via [nvm](https://github.com/nvm-sh/nvm).
- **Yarn** 1.x.
- **Google Chrome** — used to run the test suite.
- Optionally, a local [api.goodcity](https://github.com/crossroads/api.goodcity)
  running on port 3000. You can skip this and develop against staging instead
  (see [Running the app](#running-the-app)).

## Getting started

```shell
git clone https://github.com/crossroads/app.goodcity.git
cd app.goodcity
nvm use                    # picks up Node 12 from .nvmrc
yarn
yarn run bower install     # bower_components/ is gitignored, so this is required
```

If you also need to make changes to `shared.goodcity`, link it so your edits are
picked up without reinstalling:

```shell
git clone https://github.com/crossroads/shared.goodcity.git
cd shared.goodcity && yarn link && cd -
yarn link shared-goodcity
```

## Running the app

```shell
yarn start            # API at http://localhost:3000 (run api.goodcity locally)
yarn start:staging    # API at https://api-staging.goodcity.hk (instant test data)
```

Then open <http://localhost:4200>. Use `yarn start:staging` if you would rather
not run the Rails API yourself.

## Running tests

The test suite needs a dev server on port **4200** running first. `ember test`
serves the app on its own port, but the test environment points the API at
`localhost:4200` — without it, a large number of tests fail.

```shell
# terminal 1
yarn run ember server --port 4200

# terminal 2
yarn run ember test               # full suite, ~1.5 minutes
yarn run ember test -f offer      # filter by name
yarn run ember test -f item
```

Note that 125 of the tests are auto-generated JSHint lint checks — `ember-cli-jshint` emits one per module, so a lint error surfaces as a test failure.

Tests run in Chrome. On WSL2 or a desktop Linux box this works as-is. Only if
there is no display available at all do you need a virtual framebuffer:

```shell
sudo apt-get install -y google-chrome-stable xvfb
xvfb-run yarn run ember test
```

## Building for web

`ENVIRONMENT` selects which API and services the build points at, and is
**required** — the build aborts without it.

```shell
EMBER_CLI_CORDOVA=0 ENVIRONMENT=staging    yarn run ember build --environment=production
EMBER_CLI_CORDOVA=0 ENVIRONMENT=production yarn run ember build --environment=production
```

Output lands in `dist/`. `EMBER_CLI_CORDOVA=0` is what makes this a web build;
without it the build targets Cordova and injects a `cordova.js` that will 404 in
a browser.

## Native (Cordova) builds

CircleCI builds and publishes the mobile apps automatically for the `master` and
`live` branches, so you only need this to debug on a real device.

Cordova platform versions are pinned in `cordova/package.json`
(`cordova@13`, `cordova-android@15`, `cordova-ios@8`). Note the `cordova/`
directory uses **Node 24**, not Node 12 — see `cordova/.nvmrc`.

First, build the web assets with Cordova enabled and stamp the version:

```shell
EMBER_CLI_CORDOVA=1 ENVIRONMENT=staging yarn run ember build --environment=production
ln -s `pwd`/dist `pwd`/cordova/www
cd cordova
nvm use                                       # Node 24
ENVIRONMENT=staging node rename_package.js    # sets app id, name and version
```

Then add the platform and build:

```shell
# starting clean helps with Android build issues
rm -rf platforms/ plugins/ node_modules/
yarn
cordova platform add android@15
cordova build android --debug --device
```

### Debugging on a device with Android Studio

- Open Android Studio on `<project root>/cordova/platforms/android`
- Connect your phone with USB debugging enabled
- Run the usual gradle refresh and build
- Android Studio gives you native logs (useful for push notifications), and
  `edge://inspect/#devices` opens a browser inspector against the running app

### Building Android in Docker

`Dockerfile-cordova` mirrors the CircleCI Android environment, so you can build
without installing the Android SDK locally.

```shell
docker build -f Dockerfile-cordova -t app.goodcity.hk:latest .
```

With the Ember build and `rename_package.js` already done, start a container with
`dist/` and `cordova/` mounted:

```shell
docker run -d \
  -v `pwd`/dist/:/home/circleci/project/dist/ \
  -v `pwd`/cordova:/home/circleci/project/cordova/ \
  -w /home/circleci/project/cordova/ -u root -t app.goodcity.hk:latest /bin/bash
# prints a container hash, e.g. 812cb3...

docker container exec 812cb3 cordova telemetry off
docker container exec 812cb3 cordova build android --debug --device
docker cp 812cb3:/home/circleci/project/cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk .
```

The volume mounts stay live, so to rebuild you only need to remove the old APK,
rebuild the Ember app if it changed, and run `cordova build` again:

```shell
docker container exec 812cb3 rm /home/circleci/project/cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk
EMBER_CLI_CORDOVA=1 ENVIRONMENT=staging yarn run ember build --environment=production
docker container exec 812cb3 cordova build android --debug --device
```

Clean up with `docker stop 812cb3 && docker rm 812cb3`.

### Upgrading Cordova

Review the Cordova blog for breaking changes in `cordova-<platform>` and the
plugins first, then rebuild the platforms from scratch:

```shell
cd cordova
nvm use                     # Node 24
rm -rf node_modules/ platforms/ plugins/
yarn
npm install cordova@13
cordova platform remove android && cordova platform add android@15
cordova platform remove ios     && cordova platform add ios@8
```

### Building on Windows with WSL2

You can run Android Studio on the Windows side while developing in WSL2. Install
Android Studio, Node for Windows, and the Windows build tools that provide
Python, the VS runtimes and the .NET SDKs:

```shell
nvm install 12
npm install -g windows-build-tools
```

Node installs are slow if Defender scans them, so exclude the relevant paths from
an Administrator PowerShell:

```powershell
Add-MpPreference -ExclusionPath ([System.Environment]::ExpandEnvironmentVariables("%APPDATA%\npm\"))
Add-MpPreference -ExclusionPath (Get-ItemProperty "HKLM:SOFTWARE\Node.js" | Select-Object -Property InstallPath)
```

## Deployment

CircleCI handles releases from two long-lived branches:

| Branch   | Deploys to                                   |
| -------- | -------------------------------------------- |
| `master` | staging web + TestFairy builds               |
| `live`   | production web + App Store / Play Store beta |

Feature branches run the test suite only. When building the mobile apps manually,
switch your `shared.goodcity` checkout to the matching branch first.

## Contributing

- Branch from `master` using the Jira key, e.g. `GCW-1234-short-description`
- Open a pull request against `master`
- `prettier` runs automatically on commit via a git hook
- Bump the version in `package.json` and add a `CHANGELOG.md` entry when releasing

## License

See [LICENSE](LICENSE).
