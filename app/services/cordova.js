import Ember from "ember";

export default Ember.Service.extend({
  isIOS() {
    try {
      // Prefer Capacitor platform detection when available
      const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
      if (cap && typeof cap.getPlatform === "function") {
        return cap.getPlatform() === "ios";
      }
    } catch (e) {}

    // Fallback heuristic
    return (
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent)
    );
  },

  verifyIosNotificationSetting(onEnabled, _onDisabled) {
    // Cordova used native settings checks; in Capacitor we currently assume enabled
    // and route users through normal flow. This is a no-op compatibility shim.
    if (typeof onEnabled === "function") {
      onEnabled();
    }
  },

  initiatePushNotifications() {
    // No-op shim (push setup will be handled via Capacitor plugins).
  }
});
