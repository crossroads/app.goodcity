import Ember from 'ember';
import startApp from '../helpers/start-app';

var TestHelper = Ember.Object.createWithMixins(FactoryGuyTestMixin);
var App, testHelper, offer;

module('Display not found error', {
  setup: function() {
    App = startApp();
    testHelper = TestHelper.setup(App);
    Ember.run.later = () => true;
    offer = FactoryGuy.make("offer");
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
    Ember.run(App, 'destroy');
  }
});

test("Display error popup for invalid offer", function() {
  $('.reveal-modal').remove();
  visit("/offers/invalid/offer_details");

  andThen(function(){
    equal(Ember.$("#errorMessage").text(), Ember.I18n.t("404_error"));
    Ember.$('#errorModal').foundation('reveal', 'close');
  });
});

test("Display error popup for invalid item", function() {
  $('.reveal-modal').remove();
  visit("/offers/" + offer.id + "/items/invalid/messages");
  $.mockjax({url:"/api/v1/items/*",status:404});

  andThen(function(){
    equal(Ember.$("#errorMessage").text(), Ember.I18n.t("404_error"));
    Ember.$('#errorModal').foundation('reveal', 'close');
  });
});

test("Display not-found page for invalid url", function() {
  $('.reveal-modal').remove();
  visit("/invalid_url");
  andThen(function(){
    equal(currentURL(), "/invalid_url");
    notEqual(Ember.$(".xy-center").text().indexOf(Ember.I18n.t("not_found")), -1, "not found message found");
  });
});
