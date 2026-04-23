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
      const promise = Ember.RSVP.resolve().then(() =>
        this.btn1Callback ? this.btn1Callback() : false
      );
      promise
        .then(result => {
          if (result !== false && !this.isDestroyed && !this.isDestroying) {
            this.close();
          }
        })
        .catch(err => {
          if (!this.isDestroyed && !this.isDestroying) {
            this.close();
          }
          throw err;
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
