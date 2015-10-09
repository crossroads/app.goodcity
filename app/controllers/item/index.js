import Ember from "ember";

export default Ember.Controller.extend({
  offerDetailsController: Ember.inject.controller("offer/offer_details"),
  confirm: Ember.inject.service(),
  i18n: Ember.inject.service(),

  actions: {
    removeItem(item) {
      var controller = this;
      var offer = item.get('offer');

      if (offer.get("state") !== "draft" && offer.get("items.length") <= 1) {
        this.get("confirm").show(this.get("i18n").t("item.cancel_last_item_confirm"), () => {
          this.get("offerDetailsController").send("cancelOffer", offer, true);
        });
        return;
      }

      this.get("confirm").show(this.get("i18n").t("delete_confirm"), () => {
        var loadingView = controller.container.lookup('component:loading').append();

        offer.get('items').removeObject(item);

        item.destroyRecord().then(function(){
          if(offer.get('itemCount') === 0) {
            controller.transitionToRoute("offer");
          } else {
            controller.transitionToRoute("offer.offer_details");
          }
        })
        .finally(() => loadingView.destroy());
      });
    }
  }
});
