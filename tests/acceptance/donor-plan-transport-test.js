import Ember from "ember";
import startApp from "../helpers/start-app";
import FactoryGuy from "ember-data-factory-guy";
import TestHelper from "ember-data-factory-guy/factory-guy-test-helper";

var App,
  store,
  offer,
  gogovan_transport,
  crossroads_transport,
  gogovan_transport1,
  crossroads_transport1,
  offer1,
  gogovan_transport2,
  crossroads_transport2,
  offer2;

module("Donor Plan Transport:", {
  beforeEach: function() {
    App = startApp();
    TestHelper.setup();
    store = FactoryGuy.store;

    gogovan_transport = FactoryGuy.make("gogovan_transport", { name: "Van" });
    crossroads_transport = FactoryGuy.make("crossroads_transport", {
      name: "3/8 Truck"
    });
    offer = FactoryGuy.make("offer", {
      state: "reviewed",
      gogovanTransport: gogovan_transport,
      crossroadsTransport: crossroads_transport,
      crossroadsTruckCost: 200
    });

    gogovan_transport1 = FactoryGuy.make("gogovan_transport", {
      name: "Disable",
      disabled: true
    });
    crossroads_transport1 = FactoryGuy.make("crossroads_transport", {
      name: "3/8 Truck"
    });
    offer1 = FactoryGuy.make("offer", {
      state: "reviewed",
      gogovanTransport: gogovan_transport1,
      crossroadsTransport: crossroads_transport1
    });

    gogovan_transport2 = FactoryGuy.make("gogovan_transport", { name: "Van" });
    crossroads_transport2 = FactoryGuy.make("crossroads_transport_disabled");
    offer2 = FactoryGuy.make("offer", {
      state: "reviewed",
      gogovanTransport: gogovan_transport2,
      crossroadsTransport: crossroads_transport2
    });
  },

  afterEach: function() {
    Em.run(function() {
      TestHelper.teardown();
    });
    Ember.run(App, "destroy");
  }
});

test("Disable Gogovan Transport option", function() {
  visit("/offers/" + offer1.id + "/plan_delivery");

  andThen(function() {
    equal(currentURL(), "/offers/" + offer1.id + "/plan_delivery");
    equal($(".plan_delivery .small-12.columns .row").length, 3);

    // Gogovan Transport option is disabled
    var options_text = $(".plan_delivery .small-12.columns").text();
    equal(options_text.indexOf("Fastest") >= 0, false);
  });
});

test("Disable Crossroads Transport option", function() {
  visit("/offers/" + offer2.id + "/plan_delivery");

  andThen(function() {
    equal(currentURL(), "/offers/" + offer2.id + "/plan_delivery");
    equal($(".plan_delivery .small-12.columns .row").length, 3);

    // Crossroads Transport option is disabled
    var options_text = $(".plan_delivery .small-12.columns").text();
    equal(options_text.indexOf("Alternative") >= 0, false);
  });
});

test("Crossroads Transport option details", function() {
  visit("/offers/" + offer.id + "/plan_delivery");

  andThen(function() {
    equal(currentURL(), "/offers/" + offer.id + "/plan_delivery");
    equal($.trim(find(".tab-bar-section .title").text()), "Plan Transport");
    equal($(".plan_delivery .small-12.columns .row").length, 4);

    // Crossroads Transport option is disabled
    var options_text = $(".plan_delivery .small-12.columns .row:eq(2)").text();
    equal(options_text.indexOf("Alternative") >= 0, true);
    equal(options_text.indexOf("Fee $200") >= 0, true);
  });
});

test("Gogovan Transport option details", function() {
  visit("/offers/" + offer.id + "/plan_delivery");

  andThen(function() {
    equal(currentURL(), "/offers/" + offer.id + "/plan_delivery");
    equal($.trim(find(".tab-bar-section .title").text()), "Plan Transport");
    equal($(".plan_delivery .small-12.columns .row").length, 4);

    // Crossroads Transport option is disabled
    var options_text = $(".plan_delivery .small-12.columns .row:eq(0)").text();
    equal(options_text.indexOf("Fastest") >= 0, true);
    equal(options_text.indexOf("From $120") >= 0, true);
  });
});

test("Self-arranged van option details", function() {
  visit("/offers/" + offer.id + "/plan_delivery");

  andThen(function() {
    var options_text = $(".plan_delivery .small-12.columns .row:eq(1)").text();
    equal(options_text.indexOf("Arrange your own van") >= 0, true);
    equal(options_text.indexOf("You pay the driver") >= 0, true);

    // Notice only appears once in-app van booking is switched off
    equal($(".plan_delivery .van-booking-notice").length, 0);
  });
});

test("In-app van booking switched off", function() {
  Ember.run(function() {
    store.createRecord("goodcity_setting", {
      key: "app.allow_in_app_van_booking",
      value: "false"
    });
  });
  visit("/offers/" + offer.id + "/plan_delivery");

  andThen(function() {
    equal($(".plan_delivery .small-12.columns .row").length, 3);

    var options_text = $(".plan_delivery .small-12.columns").text();
    equal(options_text.indexOf("Fastest") >= 0, false);
    equal(options_text.indexOf("Arrange your own van") >= 0, true);
    equal(
      $(".plan_delivery .van-booking-notice")
        .text()
        .indexOf("Van booking has changed") >= 0,
      true
    );
  });
});
