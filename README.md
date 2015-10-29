# GoodCity App [![Circle CI](https://circleci.com/gh/crossroads/app.goodcity.svg?style=svg)](https://circleci.com/gh/crossroads/app.goodcity)

The GoodCity initiative is a new way to donate quality goods in Hong Kong. See www.goodcity.hk for more details.

## Installation

Install and configure nodejs https://github.com/creationix/nvm#install-script

```shell
npm install -g ember-cli bower phantomjs
git clone https://github.com/crossroads/shared.goodcity.git
cd shared.goodcity
npm link
cd ..
git clone https://github.com/crossroads/app.goodcity.git
cd app.goodcity
npm link shared-goodcity
ember install
```

## Running

* `npm start`
* Visit your app at http://localhost:4200.

## Running Tests

* `npm test`

## Building

* `npm build`
* `EMBER_CLI_CORDOVA=0 ember build --environment=production`

## Deployment

Deployment will be automatic from CircleCI. To deploy to the live site, simply push to the live branch.

If you wish to run the deployment manually, use the following commands. However, if deploying to the live site, be sure to switch both your local folder and shared.goodcity folders to the `live` branch first. This will ensure the correct code is built manually.

    cap staging deploy
    cap production deploy

Note you will need to have your SSH key installed on the destination servers before deployment will work.

## Upgrading Ember CLI
Documentation has moved to https://github.com/crossroads/shared.goodcity/blob/master/docs/upgrading-ember.md

## Cordova
CircleCI will automatically build apps for `master` and `live` branches. However, if you wish to do this manually you can use the following commands.

* Switch your admin.goodcity and shared.goodcity folders to the correct branch (usually `master` or `live`)
* Run `rake app:build` or `rake production android app:build` (see `Rakefile` for full command options)
* Run `rake testfairy:upload` if you wish to push the app to Testfairy.

Note: this is the same command as run on CircleCI. If you don't specify a platform, it will choose based on your current operating system. It will assume `staging` environment unless you specific otherwise.

## Development Notes
Documentation has moved to https://github.com/crossroads/shared.goodcity/blob/master/docs/development-notes.md
