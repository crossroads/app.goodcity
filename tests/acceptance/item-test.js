import Ember from 'ember';
import startApp from '../helpers/start-app';
import syncDataStub from '../helpers/empty-sync-data-stub';

var TestHelper = Ember.Object.createWithMixins(FactoryGuyTestMixin);
var App, testHelper, offer, item, display_item_url, receivedItem, receivedItemUrl;

module('Display Item', {
  setup: function() {
    App = startApp();
    testHelper = TestHelper.setup(App);
    syncDataStub(testHelper);

    offer = FactoryGuy.make("offer");
    item = FactoryGuy.make("item",{offer:offer});
    FactoryGuy.makeList("image", 2, {item:item});
    display_item_url = "/offers/" + offer.id + "/items/" + item.id + "/messages";
    receivedItem = FactoryGuy.make("received_item", {offer: offer});
    receivedItemUrl = "/offers/" + offer.id + "/items/" + receivedItem.id + "/messages";
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
    Ember.run(App, 'destroy');
  }
});

test("Display Item Details", function() {
  visit(display_item_url);

  andThen(function(){
    equal(currentURL(), display_item_url);
    equal($('body').text().indexOf(item.get('donorDescription')) >= 0, true);
    equal(find("img.thumb").length, 1);
    equal(find(".item_actions a").length, 2);
  });
});

test("Do not allow Donor to edit/update item", function() {
  visit(receivedItemUrl);

  andThen(function(){
    equal(currentURL(), receivedItemUrl);
    equal(find(".item_actions a").length, 0);
  });
});

test("Back button redirects to its offer details", function() {
  expect(1);

  visit(display_item_url);
  click('.back');

  andThen(function() {
    equal(currentURL(), "/offers/" + offer.id + "/offer_details");
  });
});
