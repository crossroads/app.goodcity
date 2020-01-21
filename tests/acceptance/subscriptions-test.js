import { run } from "@ember/runloop";
import startApp from "../helpers/start-app";
import FactoryGuy from "ember-data-factory-guy";
import TestHelper from "ember-data-factory-guy/factory-guy-test-helper";
import testSkip from "../helpers/test-skip";

var App;

module("Subscriptions", {
  beforeEach: function() {
    App = startApp();
    TestHelper.setup();
  },
  afterEach: function() {
    Em.run(function() {
      TestHelper.teardown();
    });
    run(App, "destroy");
  }
});

testSkip(
  "updateStore doesn't process before response to model.save request",
  function() {
    expect(2);

    var store = FactoryGuy.store;
    var subscriptions = lookup("controller:subscriptions");
    var user = FactoryGuy.make("user");
    FactoryGuy.make("user_profile", { id: user.id });
    var offer = { id: 2 };

    $.mockjaxSettings.logging = true;
    $.mockjax({
      url: "/api/v1/offer*",
      status: 201,
      response: function() {
        run(function() {
          subscriptions.update_store(
            {
              item: { offer: offer },
              sender: { user: user.toJSON({ includeId: true }) },
              operation: "create"
            },
            function() {}
          );
        });
        this.responseText = { offer: offer };
      }
    });

    run(function() {
      store
        .createRecord("offer", { createdBy: user })
        .save()
        .then(function() {
          equal(store.all("offer").get("length"), 1);
          equal(store.all("offer").get("firstObject.id"), offer.id);
        });
    });

    // causes test to wait for next ember run loop before completing
    andThen(function() {});
  }
);
