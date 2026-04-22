import Ember from "ember";

function logError(message, error) {
  if (Ember.Logger && typeof Ember.Logger.error === "function") {
    Ember.Logger.error(message, error);
  } else {
    console.error(message, error);
  }
}

function logWarn(message) {
  if (Ember.Logger && typeof Ember.Logger.warn === "function") {
    Ember.Logger.warn(message);
  } else {
    console.warn(message);
  }
}

function isNativeCapacitorShell() {
  const cap =
    typeof window !== "undefined" && window.Capacitor ? window.Capacitor : null;
  if (!cap || typeof cap.getPlatform !== "function") {
    return false;
  }
  const platform = cap.getPlatform();
  return platform === "ios" || platform === "android";
}

function getPushNotificationsPlugin() {
  const cap =
    typeof window !== "undefined" && window.Capacitor ? window.Capacitor : null;
  const plugins = cap && cap.Plugins ? cap.Plugins : null;
  return plugins ? plugins.PushNotifications : null;
}

export default Ember.Service.extend({
  isIOS() {
    try {
      // Prefer Capacitor platform detection when available
      const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
      if (cap && typeof cap.getPlatform === "function") {
        return cap.getPlatform() === "ios";
      }
    } catch (e) {}

    // Do not treat Mobile Safari as "native iOS" for Cordova-era flows unless we
    // are actually running in a legacy native shell (Cordova) or an explicit
    // legacy escape hatch is enabled.
    const legacyCordova =
      typeof window !== "undefined" && typeof window.cordova !== "undefined";
    const root =
      typeof globalThis !== "undefined"
        ? globalThis
        : typeof window !== "undefined"
        ? window
        : typeof global !== "undefined"
        ? global
        : undefined;
    const legacyFlag =
      (root && root.__ENABLE_CORDOVA_LEGACY__) ||
      (typeof process !== "undefined" &&
        process.env &&
        process.env.ENABLE_CORDOVA_LEGACY === "true");

    if (!legacyCordova && !legacyFlag) {
      return false;
    }

    return (
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent)
    );
  },

  verifyIosNotificationSetting(onEnabled, onDisabled) {
    // Check (and request) notification permission via @capacitor/push-notifications
    // on native shells. In the browser, behave as disabled without noisy logs.
    (async () => {
      try {
        if (!isNativeCapacitorShell()) {
          if (typeof onDisabled === "function") onDisabled();
          return;
        }

        const push = getPushNotificationsPlugin();
        if (!push || typeof push.checkPermissions !== "function") {
          logError(
            "cordova service: Capacitor PushNotifications is missing or invalid. Install @capacitor/push-notifications and run cap sync."
          );
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
        logError("cordova service: verifyIosNotificationSetting failed", e);
        if (typeof onDisabled === "function") onDisabled();
      }
    })();
  },

  initiatePushNotifications() {
    (async () => {
      try {
        if (!isNativeCapacitorShell()) {
          logWarn(
            "cordova service: initiatePushNotifications called outside a native Capacitor shell; skipping."
          );
          return;
        }

        const push = getPushNotificationsPlugin();
        if (!push || typeof push.requestPermissions !== "function") {
          logError(
            "cordova service: initiatePushNotifications: PushNotifications plugin missing or invalid."
          );
          return;
        }

        await push.requestPermissions();
      } catch (e) {
        logError("cordova service: initiatePushNotifications failed", e);
      }
    })();
  }
});
