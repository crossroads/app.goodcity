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

  verifyIosNotificationSetting(onEnabled, onDisabled) {
    // Until we fully migrate push notifications, prefer the safe/explicit path:
    // check (and request) iOS push permission via Capacitor when available.
    // If we can't check, treat it as disabled so the UI can guide the user.
    (async () => {
      try {
        const cap =
          typeof window !== "undefined" ? window.Capacitor : undefined;
        const plugins = cap && cap.Plugins ? cap.Plugins : undefined;
        const push = plugins ? plugins.PushNotifications : undefined;

        if (!push || typeof push.checkPermissions !== "function") {
          if (typeof onDisabled === "function") onDisabled();
          return;
        }

        let perms = await push.checkPermissions();
        if (perms && perms.receive === "prompt") {
          perms = await push.requestPermissions();
        }

        if (perms && perms.receive === "granted") {
          if (typeof onEnabled === "function") onEnabled();
        } else {
          if (typeof onDisabled === "function") onDisabled();
        }
      } catch (e) {
        if (typeof onDisabled === "function") onDisabled();
      }
    })();
  },

  initiatePushNotifications() {
    // Best-effort permission prompt for Capacitor push notifications.
    (async () => {
      try {
        const cap =
          typeof window !== "undefined" ? window.Capacitor : undefined;
        const plugins = cap && cap.Plugins ? cap.Plugins : undefined;
        const push = plugins ? plugins.PushNotifications : undefined;

        if (!push || typeof push.requestPermissions !== "function") return;
        await push.requestPermissions();
      } catch (e) {}
    })();
  }
});
