import Ember from "ember";
import startApp from "../helpers/start-app";
import TestHelper from "ember-data-factory-guy/factory-guy-test-helper";
import { module, test } from "qunit";

var App, originalCapacitor;

function pushListenerHandle() {
  return Ember.RSVP.resolve({
    remove: function() {
      return Ember.RSVP.resolve();
    }
  });
}

function installPushStub(options) {
  options = options || {};
  var listeners = {};
  var checkPermissionsCount = 0;

  window.Capacitor = {
    getPlatform: function() {
      return options.platform || "android";
    },
    Plugins: {
      PushNotifications: {
        checkPermissions: function() {
          checkPermissionsCount += 1;
          var receive = "granted";
          if (options.promptFirst && checkPermissionsCount === 1) {
            receive = "prompt";
          }
          return Ember.RSVP.resolve({
            receive: receive
          });
        },
        requestPermissions: function() {
          if (typeof options.onRequestPermissions === "function") {
            options.onRequestPermissions();
          }
          return Ember.RSVP.resolve({ receive: "granted" });
        },
        addListener: function(eventName, callback) {
          listeners[eventName] = callback;
          return pushListenerHandle();
        },
        register: function() {
          if (typeof options.onRegister === "function") {
            options.onRegister();
          }
          return Ember.RSVP.resolve();
        }
      }
    }
  };

  return listeners;
}

module("Acceptance: Push Registration", {
  beforeEach: function() {
    originalCapacitor = window.Capacitor;
    App = startApp();
    TestHelper.setup();
  },
  afterEach: function() {
    window.Capacitor = originalCapacitor;
    Ember.run(function() {
      TestHelper.teardown();
    });
    Ember.run(App, "destroy");
  }
});

test("registers push notifications when auth token is set after login", function(assert) {
  assert.expect(3);

  var requestPermissionsCount = 0;
  var registerCount = 0;

  installPushStub({
    promptFirst: true,
    onRequestPermissions: function() {
      requestPermissionsCount += 1;
    },
    onRegister: function() {
      registerCount += 1;
    }
  });

  Ember.run(function() {
    var session = App.__container__.lookup("service:session");
    session.set("authToken", null);
  });
  App.__container__.lookup("service:cordova");

  assert.equal(registerCount, 0, "does not register before login");
  Ember.run(function() {
    var session = App.__container__.lookup("service:session");
    session.set("authToken", "jwt-after-login");
  });

  andThen(function() {
    assert.equal(
      requestPermissionsCount,
      1,
      "requests notification permission after login"
    );
    assert.equal(registerCount, 1, "registers push notifications after login");
  });
});

test("routes tapped push notifications", function(assert) {
  assert.expect(3);

  var listeners = installPushStub();
  var notifications;
  var routedPayload;
  var transitionRoute;

  Ember.run(function() {
    notifications = App.__container__.lookup("controller:notifications");
    notifications.setRoute = function(payload) {
      routedPayload = payload;
      payload.route = ["offer", payload.offer_id];
    };
    notifications.transitionToRoute = function() {
      transitionRoute = Array.prototype.slice.call(arguments);
    };

    App.__container__.lookup("service:cordova").initiatePushNotifications();
  });

  andThen(function() {
    assert.ok(
      listeners.pushNotificationActionPerformed,
      "registers push notification action listener"
    );
    Ember.run(function() {
      listeners.pushNotificationActionPerformed({
        notification: {
          data: {
            category: "new_offer",
            offer_id: 123
          }
        }
      });
    });
  });

  andThen(function() {
    assert.equal(
      routedPayload.category,
      "new_offer",
      "passes payload to notifications controller"
    );
    assert.deepEqual(
      transitionRoute,
      ["offer", 123],
      "transitions to computed notification route"
    );
  });
});

test("accepts incoming call push notifications before routing", function(assert) {
  assert.expect(2);

  var listeners = installPushStub();
  var notifications;
  var acceptedPayload;
  var transitionRoute;

  Ember.run(function() {
    notifications = App.__container__.lookup("controller:notifications");
    notifications.acceptCall = function(payload) {
      acceptedPayload = payload;
    };
    notifications.setRoute = function(payload) {
      payload.route = ["offer", payload.offer_id];
    };
    notifications.transitionToRoute = function() {
      transitionRoute = Array.prototype.slice.call(arguments);
    };

    App.__container__.lookup("service:cordova").initiatePushNotifications();
  });

  andThen(function() {
    Ember.run(function() {
      listeners.pushNotificationActionPerformed({
        notification: {
          data: {
            category: "incoming_call",
            offer_id: 456,
            author_id: 789
          }
        }
      });
    });
  });

  andThen(function() {
    assert.equal(
      acceptedPayload.author_id,
      789,
      "accepts incoming call payload"
    );
    assert.deepEqual(
      transitionRoute,
      ["offer", 456],
      "routes after accepting call"
    );
  });
});
