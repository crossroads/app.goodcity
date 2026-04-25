/* jshint node: true */
const pkgJson = require("../package.json");
const url = require("url");

function uniqueStrings(values) {
  const out = [];
  const seen = {};
  (values || []).forEach(v => {
    if (!v) {
      return;
    }
    if (seen[v]) {
      return;
    }
    seen[v] = true;
    out.push(v);
  });
  return out;
}

// Adds http(s) origins plus ws/wss equivalents for websocket-capable hosts.
function cspConnectOriginsFromAppUrl(urlString) {
  if (!urlString) {
    return [];
  }

  let parsed;
  try {
    parsed = new url.URL(urlString);
  } catch (e) {
    return [];
  }

  const origins = [parsed.origin];

  if (parsed.protocol === "https:") {
    origins.push("wss://" + parsed.host);
    origins.push("ws://" + parsed.host);
  } else if (parsed.protocol === "http:") {
    origins.push("ws://" + parsed.host);
    origins.push("wss://" + parsed.host);
  } else if (parsed.protocol === "wss:") {
    origins.push("https://" + parsed.host);
    origins.push("http://" + parsed.host);
    origins.push("ws://" + parsed.host);
  } else if (parsed.protocol === "ws:") {
    origins.push("http://" + parsed.host);
    origins.push("https://" + parsed.host);
    origins.push("wss://" + parsed.host);
  }

  return uniqueStrings(origins);
}

module.exports = function(environment) {
  environment = process.env.ENVIRONMENT || environment || "development";
  var ENV = {
    modulePrefix: "goodcity",
    environment: environment,
    baseURL: "/",
    defaultLocationType: "auto",

    emberRollbarClient: {
      enabled: environment !== "test" && environment !== "development",
      accessToken: "9db40d21a058461081ac9b666f59cd8b",
      verbose: true,
      ignoredMessages: ["TransitionAborted"],
      payload: {
        environment: environment,
        client: {
          javascript: {
            // Optionally have Rollbar guess which frames the error was thrown from
            // when the browser does not provide line and column numbers.
            guess_uncaught_frames: false
          }
        }
      }
    },

    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },
    contentSecurityPolicy: {
      "default-src": "'self' http://localhost file://* *",
      "img-src":
        "'self' data: https://res.cloudinary.com filesystem: * https://goodcityimages.blob.core.windows.net",
      "style-src": "'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com",
      "font-src": "'self' data: https://maxcdn.bootstrapcdn.com",
      "script-src":
        "'self' 'unsafe-inline' 'unsafe-eval' https://widget.uservoice.com https://by2.uservoice.com https://api.sandbox.braintreegateway.com https://client-analytics.sandbox.braintreegateway.com",
      "frame-src":
        "'self' 'unsafe-inline' 'unsafe-eval' https://widget.uservoice.com https://assets.braintreegateway.com https://checkout.paypal.com"
    },
    APP: {
      // Cloudinary Keys
      NAME: "app.goodcity",
      TITLE: "GoodCity",
      BANNER_IMAGE: "/assets/images/donor.png",
      APPLE_APP_ID: "1012253845",
      REVIEW_APP_NAME: "GoodCity",
      CLOUD_NAME: "ddoadcjjl",
      ANDROID_APP_URL: "market://details?id=hk.goodcity.app",
      CLOUD_API_KEY: 926849638736153,
      CLOUD_URL: "https://api.cloudinary.com/v1_1/ddoadcjjl/auto/upload",
      IMAGE_PATH: "http://res.cloudinary.com/ddoadcjjl/image/upload/",
      HK_COUNTRY_CODE: "+852",
      GOGOVAN_CONTACT: "3590 3399",
      CROSSROADS_CONTACT: "2984 9309",
      GMAP_URL:
        "https://www.google.com.hk/maps/place/22%C2%B022'27.9%22N+113%C2%B059'36.1%22E/@22.3744154,113.9758515,14z/data=!3m1!4b1!4m2!3m1!1s0x0:0x0",
      // RESTAdapter Settings
      NAMESPACE: "api/v1",
      OTP_RESEND_TIME: 60,
      CONTACT_EMAIL: "contact@goodcity.hk",

      PRELOAD_TYPES: ["territory"],
      PRELOAD_AUTHORIZED_TYPES: [
        "donor_condition",
        "permission",
        "timeslot",
        "gogovan_transport",
        "crossroads_transport"
      ],
      SHA: process.env.APP_SHA || "00000000",
      SHARED_SHA: process.env.APP_SHARED_SHA || "00000000",
      VERSION: pkgJson.version || "1.0.0",
      ANDROID_APP_ID: "hk.goodcity.app",
      IOS_APP_ID: "1012253845"
    },

    coffeeOptions: {
      blueprints: false
    },
    i18n: {
      defaultLocale: "en"
    }
  };

  if (environment === "development") {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    // RESTAdapter Settings
    // Allow running the app in development mode while pointing at a non-local API
    // (useful for mobile simulators/devices).
    ENV.APP.API_HOST_URL = process.env.API_HOST_URL || "http://localhost:3000";
    ENV.APP.SOCKETIO_WEBSERVICE_URL =
      process.env.SOCKETIO_WEBSERVICE_URL || "http://localhost:1337/goodcity";

    ENV.contentSecurityPolicy["connect-src"] = uniqueStrings(
      [
        "http://localhost:4200",
        "http://localhost:3000",
        "http://localhost:1337",
        "ws://localhost:1337",
        "wss://localhost:1337",
        "https://api-staging.goodcity.hk",
        "https://socket-staging.goodcity.hk",
        "wss://socket-staging.goodcity.hk",
        "ws://socket-staging.goodcity.hk",
        "https://api.cloudinary.com",
        "https://api.rollbar.com",
        "https://www.google-analytics.com"
      ]
        .concat(cspConnectOriginsFromAppUrl(ENV.APP.API_HOST_URL))
        .concat(cspConnectOriginsFromAppUrl(ENV.APP.SOCKETIO_WEBSERVICE_URL))
    ).join(" ");
    //Only added for development env. to fix issue related to BLOB: object
    ENV.contentSecurityPolicy["img-src"] = [
      "http://localhost:4200",
      "data: https://res.cloudinary.com",
      "blob: filesystem/g",
      "filesystem: *"
    ].join(" ");
  }

  if (environment === "test") {
    // Testem prefers this...
    ENV.baseURL = "/";
    ENV.locationType = "auto";

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = "#ember-testing";

    // RESTAdapter Settings
    ENV.APP.API_HOST_URL = "http://localhost:4200";
  }

  if (environment === "production") {
    if (!process.env.ENVIRONMENT) {
      throw "Please pass an appropriate ENVIRONMENT=(staging|production) param.";
    }
    // RESTAdapter Settings
    ENV.APP.API_HOST_URL = "https://api.goodcity.hk";
    ENV.APP.SOCKETIO_WEBSERVICE_URL = "https://socket.goodcity.hk:81/goodcity";

    ENV.contentSecurityPolicy["connect-src"] = [
      "https://app.goodcity.hk",
      "https://api.goodcity.hk",
      "https://socket.goodcity.hk:81",
      "ws://socket.goodcity.hk:81",
      "wss://socket.goodcity.hk:81",
      "https://api.cloudinary.com",
      "https://api.rollbar.com",
      "https://www.google-analytics.com"
    ].join(" ");

    ENV.googleAnalytics = {
      webPropertyId: "UA-62978462-1"
    };
  }

  if (environment === "staging") {
    ENV.staging = true;
    ENV.APP.API_HOST_URL = "https://api-staging.goodcity.hk";
    ENV.APP.SOCKETIO_WEBSERVICE_URL =
      "https://socket-staging.goodcity.hk/goodcity";
    ENV.contentSecurityPolicy["connect-src"] = [
      "https://app-staging.goodcity.hk",
      "https://api-staging.goodcity.hk",
      "https://socket-staging.goodcity.hk",
      "ws://socket-staging.goodcity.hk",
      "wss://socket-staging.goodcity.hk",
      "https://api.cloudinary.com",
      "https://api.rollbar.com",
      "https://www.google-analytics.com"
    ].join(" ");

    ENV.googleAnalytics = {
      webPropertyId: "UA-62978462-4"
    };
  } else {
    ENV.staging = false;
  }

  ENV.APP.SERVER_PATH = ENV.APP.API_HOST_URL + "/" + ENV.APP.NAMESPACE;
  ENV.APP.LONG_TERM_IMAGE_STORAGE_ID_PREFIX = "azure-";
  ENV.APP.LONG_TERM_IMAGE_STORAGE_BASE_URL =
    "https://goodcityimages.blob.core.windows.net/images-" + environment + "/";

  return ENV;
};
