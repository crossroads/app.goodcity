/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'goodcity',
    environment: environment,
    baseURL: '/',
    defaultLocationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },
    contentSecurityPolicy: {
      "img-src": "'self' data: https://res.cloudinary.com",
      "style-src": "'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com",
      "font-src": "'self' data: https://maxcdn.bootstrapcdn.com"
    },

    APP: {
      // Cloudinary Keys
      NAME: 'app.goodcity',
      CLOUD_NAME: 'ddoadcjjl',
      CLOUD_API_KEY: 926849638736153,
      CLOUD_URL: 'https://api.cloudinary.com/v1_1/ddoadcjjl/auto/upload',
      IMAGE_PATH: 'http://res.cloudinary.com/ddoadcjjl/image/upload/',
      HK_COUNTRY_CODE: '+852',
      // RESTAdapter Settings
      NAMESPACE: 'api/v1',
      CONTACT_EMAIL: 'info@goodcity.hk',

      PRELOAD_TYPES: ["territory"],
      PRELOAD_AUTHORIZED_TYPES: ["offer","item_type","donor_condition","rejection_reason","permission", "timeslot", "gogovan_transport", "crossroads_transport"],
      SHA: process.env.APP_SHA || "00000000",
      VERSION: "1.0.0"
    },

    cordova: {
      rebuildOnChange: false,
      emulate: false
    }
  };

  if (environment === 'development') {

    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    // RESTAdapter Settings
    ENV.APP.API_HOST_URL = 'http://localhost:3000';
    ENV.APP.SOCKETIO_WEBSERVICE_URL = 'http://localhost:1337/goodcity';

    ENV.contentSecurityPolicy["connect-src"] = 'http://localhost:3000 http://localhost:1337 ws://localhost:1337 https://api.cloudinary.com';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'auto';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';

    // RESTAdapter Settings
    ENV.APP.API_HOST_URL = 'http://localhost:4200';
  }

  if (environment === 'production') {
    // RESTAdapter Settings
    ENV.APP.API_HOST_URL = 'https://api.goodcity.hk';
    ENV.APP.SOCKETIO_WEBSERVICE_URL = 'https://socket.goodcity.hk:81/goodcity';
    //Airbrake Js keys
    ENV.APP.AIRBRAKE_HOST = "https://errbit.crossroads.org.hk";
    ENV.APP.AIRBRAKE_PROJECT_ID = 0;
    ENV.APP.AIRBRAKE_PROJECT_KEY = "010f0d73f56efb6150cb2744e814e46b";

    ENV.contentSecurityPolicy["connect-src"] = 'https://api.goodcity.hk https://socket.goodcity.hk:81 ws://socket.goodcity.hk:81 https://api.cloudinary.com';

    if (process.env.staging === 'true') {
      ENV.staging = true;
      ENV.APP.API_HOST_URL = 'https://api-staging.goodcity.hk';
      ENV.APP.SOCKETIO_WEBSERVICE_URL = 'https://socket-staging.goodcity.hk:81/goodcity';
      ENV.contentSecurityPolicy["connect-src"] = 'https://api-staging.goodcity.hk https://socket-staging.goodcity.hk:81 ws://socket-staging.goodcity.hk:81 https://api.cloudinary.com';
    }
  }

  ENV.APP.SERVER_PATH  = ENV.APP.API_HOST_URL + '/' + ENV.APP.NAMESPACE;

  return ENV;
};
