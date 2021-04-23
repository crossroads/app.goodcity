import Ember from "ember";
const { getOwner } = Ember;

export default Ember.Controller.extend({
  offer: Ember.computed.alias("model.offer"),
  i18n: Ember.inject.service(),
  itemDescriptionPlaceholder: Ember.computed(function() {
    return this.get("i18n").t("items.add_item.description_placeholder").string;
  }),

  isOfferReviewed: Ember.computed(
    "model",
    "model.state",
    "offer",
    "offer.state",
    function() {
      return this.get("offer.state") === "received";
    }
  ),

  formData: Ember.computed("model.{donorConditionId,donorDescription}", {
    get: function() {
      return {
        donorConditionId: this.get("model.donorConditionId"),
        donorDescription: this.get("model.donorDescription")
      };
    },
    set: function(key, value) {
      return {
        donorConditionId: value.get("donorConditionId"),
        donorDescription: value.get("donorDescription")
      };
    }
  }),

  actions: {
    submitItem() {
      if (this.get("model.state") === "draft") {
        this.set("model.state_event", "submit");
      }

      var data = this.get("formData");
      this.get("model").setProperties({
        donorDescription: data.donorDescription,
        donorCondition: this.get("store").peekRecord(
          "donorCondition",
          data.donorConditionId
        )
      });
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();

      this.get("model")
        .save()
        .then(() => {
          this.set("model.state_event", null);
          this.transitionToRoute("offer.offer_details");
        })
        .catch(error => {
          this.get("model").rollbackAttributes();
          throw error;
        })
        .finally(() => loadingView.destroy());
    },

    discardChanges(item) {
      var controller = this;
      var offer = item.get("offer");
      if (item.get("state") === "draft") {
        var loadingView = getOwner(controller)
          .lookup("component:loading")
          .append();
        item
          .destroyRecord()
          .then(function() {
            var route =
              offer.get("itemCount") === 0 ? "offer" : "offer.offer_details";
            controller.transitionToRoute(route);
          })
          .finally(() => loadingView.destroy());
      } else {
        controller.set("formData", item);
        controller.transitionToRoute("offer.offer_details");
      }
    }
  }
});
