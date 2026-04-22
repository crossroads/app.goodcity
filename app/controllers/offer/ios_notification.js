import Ember from "ember";

export default Ember.Controller.extend({
  cordova: Ember.inject.service(),
  displayUserPrompt: false,
  timer: null,
  _currentFunction: null,

  pollingFunction() {
    var onEnabled = () => {
      this.set("displayUserPrompt", false);
      this.stop();
      this.transitionToRoute("offer.submit");
    };

    var onDisabled = () => {
      this.set("displayUserPrompt", true);
    };

    this.get("cordova").verifyIosNotificationSetting(onEnabled, onDisabled);
  },

  start(context, pollingFunction) {
    this.set("_currentFunction", this._schedule(context, pollingFunction));
  },

  stop() {
    Ember.run.cancel(this.get("_currentFunction"));
  },

  _schedule(context, func) {
    return Ember.run.later(
      this,
      function() {
        this.set("_currentFunction", this._schedule(context, func));
        func.apply(context);
      },
      1000
    );
  },

  actions: {
    sendPushNotification() {
      this.get("cordova").initiatePushNotifications();
      this.start(this, this.pollingFunction);
    },

    closeDialog() {
      this.stop();
    },

    openSettings() {
      // Cordova-specific behavior removed; settings deep-linking (if desired)
      // should be implemented via a Capacitor plugin.
      console.log("openSettings not implemented for Capacitor");
    }
  }
});
