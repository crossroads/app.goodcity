import Ember from "ember";
import MessagesBaseController from "shared-goodcity/controllers/messages_base";

export default MessagesBaseController.extend({
  item: null,
  noMessage: Ember.computed.empty("model"),
  offerDetailsController: Ember.inject.controller("offer/offer_details"),

  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  cancelByDonor: Ember.computed('item', {
    get() {
      return false;
    },
    set(key, value) {
      return value;
    }
  }),

  isItemVanished: Ember.computed.or('item.isDeleted', 'item.isDeleting'),

  showDeleteError: Ember.observer('item', 'isItemVanished', function(){
    var currentPath = window.location.href;

    if(this.get("isItemVanished") && !this.get("cancelByDonor")) {
      if(currentPath.indexOf(`items/${this.get("item.id")}`) >= 0) {
        this.get("messageBox").alert(this.get("i18n").t("404_error"), () => this.transitionTo("offers"));
      }
    }
  }),

  actions: {
    removeItem(item) {
      var controller = this;
      var offer = item.get('offer');

      if (offer.get("state") !== "draft" && offer.get("items.length") <= 1) {
        this.get("messageBox").confirm(this.get("i18n").t("item.cancel_last_item_confirm"), () => {
          this.get("offerDetailsController").send("cancelOffer", offer, true);
        });
        return;
      }

      this.get("messageBox").confirm(this.get("i18n").t("delete_confirm"), () => {
        this.set("cancelByDonor", true);
        var loadingView = controller.container.lookup('component:loading').append();

        offer.get('items').removeObject(item);

        item.destroyRecord().then(function(){
          if(offer.get('itemCount') === 0) {
            controller.transitionToRoute("offer");
          } else {
            controller.transitionToRoute("offer.offer_details");
          }
        })
        .finally(() => {loadingView.destroy(); this.set("cancelByDonor", false);});
      });
    }
  }

});
