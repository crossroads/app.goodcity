import Ember from "ember";
import messageBox from "../templates/components/message-box";

export default Ember.Component.extend({
  layout: messageBox,
  message: "",
  btn1Text: "",
  btn1Callback: () => {},
  btn2Text: "",
  btn2Callback: () => {},
  displayCloseLink: false,

  isVisible: false,

  close() {
    if (this.get("isVisible")) {
      this.set("isVisible", false);
    } else {
      this.destroy();
    }
  },

  actions: {
    btn1Click() {
      var callbackOutput = true;
      try {
        if (this.btn1Callback) {
          callbackOutput = this.btn1Callback();
        }
      } catch (e) {
        callbackOutput = false;
      }
      Ember.RSVP.resolve(callbackOutput).then(result => {
        if (result !== false) {
          this.close();
        }
      });
    },

    btn2Click() {
      if (this.btn2Callback) {
        this.btn2Callback();
      }
      this.close();
    },

    closeModal() {
      this.close();
    }
  }
});
