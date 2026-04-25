import Ember from "ember";
import startApp from "../helpers/start-app";
import TestHelper from "ember-data-factory-guy/factory-guy-test-helper";
import { module, test } from "qunit";

var App, originalCapacitor;

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

  var checkPermissionsCount = 0;
  var requestPermissionsCount = 0;
  var registerCount = 0;

  window.Capacitor = {
    getPlatform: function() {
      return "android";
    },
    Plugins: {
      PushNotifications: {
        checkPermissions: function() {
          checkPermissionsCount += 1;
          return Ember.RSVP.resolve({
            receive: checkPermissionsCount > 1 ? "granted" : "prompt"
          });
        },
        requestPermissions: function() {
          requestPermissionsCount += 1;
          return Ember.RSVP.resolve({ receive: "granted" });
        },
        addListener: function() {
          return Ember.RSVP.resolve({
            remove: function() {
              return Ember.RSVP.resolve();
            }
          });
        },
        register: function() {
          registerCount += 1;
          return Ember.RSVP.resolve();
        }
      }
    }
  };

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
