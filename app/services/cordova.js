/* jshint esversion: 8, esnext: false */
/* global globalThis, global, process */

import Ember from "ember";
import AjaxPromise from "../utils/ajax-promise";

function logError(message, error) {
  if (Ember.Logger && typeof Ember.Logger.error === "function") {
    Ember.Logger.error(message, error);
  } else {
    console.error(message, JSON.stringify(error));
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

function getAppLauncherPlugin() {
  const cap =
    typeof window !== "undefined" && window.Capacitor ? window.Capacitor : null;
  const plugins = cap && cap.Plugins ? cap.Plugins : null;
  return plugins ? plugins.AppLauncher : null;
}

function getNativeSettingsPlugin() {
  const cap =
    typeof window !== "undefined" && window.Capacitor ? window.Capacitor : null;
  const plugins = cap && cap.Plugins ? cap.Plugins : null;
  return plugins ? plugins.NativeSettings : null;
}

/** Values expected by POST /api/v1/auth/register_device (Azure NH platform names). */
function pushPlatformForRegisterDeviceApi(capPlatform) {
  if (capPlatform === "android") {
    return "fcm";
  }
  if (capPlatform === "ios") {
    return "apns";
  }
  return "fcm";
}

function extractPushRegistrationToken(payload) {
  if (!payload) {
    return null;
  }
  if (typeof payload.value === "string") {
    return payload.value;
  }
  if (typeof payload === "string") {
    return payload;
  }
  return null;
}

export default Ember.Service.extend(Ember.Evented, {
  session: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.set("lastRegisteredPushToken", null);
    this.set("lastRegisteredPushPlatform", null);
    this.set("lastRegisteredPushPosted", false);
    this.set("_pushRegistrationListenersAttached", false);
    this.set("_pushRegistrationTearDown", null);
    this.addObserver("session.authToken", this, "_onSessionAuthTokenChanged");
  },

  willDestroy() {
    this._super(...arguments);
    this.removeObserver(
      "session.authToken",
      this,
      "_onSessionAuthTokenChanged"
    );
    const tearDown = this.get("_pushRegistrationTearDown");
    if (typeof tearDown === "function") {
      Ember.RSVP.resolve(tearDown())
        .catch(() => {})
        .finally(() => {
          this.set("_pushRegistrationTearDown", null);
          this.set("_pushRegistrationListenersAttached", false);
        });
    }
  },

  _ensurePushRegistrationListeners(push) {
    if (this.get("_pushRegistrationListenersAttached")) {
      return Ember.RSVP.resolve();
    }
    if (typeof push.addListener !== "function") {
      logError(
        "cordova service: PushNotifications.addListener is missing (Capacitor Push Notifications plugin)."
      );
      return Ember.RSVP.resolve();
    }

    let registrationHandle;
    let registrationErrorHandle;
    return Ember.RSVP.resolve()
      .then(() => {
        return push.addListener("registration", payload => {
          Ember.run(this, function() {
            this._onPushRegistrationSuccess(payload);
          });
        });
      })
      .then(handle => {
        registrationHandle = handle;
        const tearDown = () => {
          const removals = [];
          try {
            if (
              registrationHandle &&
              typeof registrationHandle.remove === "function"
            ) {
              removals.push(registrationHandle.remove());
            }
          } catch (e) {
            logWarn("cordova service: push listener teardown failed");
          }
          return Ember.RSVP.all(removals).catch(() => {});
        };
        this.set("_pushRegistrationTearDown", tearDown);
        return push.addListener("registrationError", err => {
          Ember.run(this, function() {
            this._onPushRegistrationError(err);
          });
        });
      })
      .then(handle => {
        registrationErrorHandle = handle;

        const tearDown = () => {
          const removals = [];
          try {
            if (
              registrationHandle &&
              typeof registrationHandle.remove === "function"
            ) {
              removals.push(registrationHandle.remove());
            }
            if (
              registrationErrorHandle &&
              typeof registrationErrorHandle.remove === "function"
            ) {
              removals.push(registrationErrorHandle.remove());
            }
          } catch (e) {
            logWarn("cordova service: push listener teardown failed");
          }
          return Ember.RSVP.all(removals).catch(() => {});
        };
        this.set("_pushRegistrationTearDown", tearDown);
        this.set("_pushRegistrationListenersAttached", true);
      })
      .catch(e => {
        logError("cordova service: PushNotifications addListener failed", e);
        const tearDown = this.get("_pushRegistrationTearDown");
        if (typeof tearDown === "function") {
          Ember.RSVP.resolve(tearDown())
            .catch(() => {})
            .finally(() => {
              Ember.run(this, function() {
                this.set("_pushRegistrationTearDown", null);
                this.set("_pushRegistrationListenersAttached", false);
              });
              registrationHandle = undefined;
              registrationErrorHandle = undefined;
            });
        } else {
          Ember.run(this, function() {
            this.set("_pushRegistrationListenersAttached", false);
          });
          registrationHandle = undefined;
          registrationErrorHandle = undefined;
        }
      });
  },

  _onPushRegistrationError(err) {
    logError("cordova service: PushNotifications registrationError", err);
  },

  _onSessionAuthTokenChanged() {
    Ember.run.once(this, "_ensurePushRegistrationAfterAuth");
  },

  _ensurePushRegistrationAfterAuth() {
    const authToken = this.get("session.authToken");
    if (!authToken) {
      return;
    }
    // Best-effort only. If we're not in a native Capacitor shell, or permissions
    // are not granted, initiatePushNotifications will no-op.
    try {
      this.initiatePushNotifications();
    } catch (e) {
      // Never block login flow on native push setup.
    }
  },

  _onPushRegistrationSuccess(payload) {
    const token = extractPushRegistrationToken(payload);
    if (!token) {
      logWarn(
        "cordova service: registration event without usable token (payload missing value)"
      );
      return;
    }

    const cap = (typeof window !== "undefined" && window.Capacitor) || null;
    const capPlatform =
      cap && typeof cap.getPlatform === "function" ? cap.getPlatform() : "";

    if (
      token === this.get("lastRegisteredPushToken") &&
      capPlatform === this.get("lastRegisteredPushPlatform") &&
      this.get("lastRegisteredPushPosted")
    ) {
      return;
    }

    if (
      token !== this.get("lastRegisteredPushToken") ||
      capPlatform !== this.get("lastRegisteredPushPlatform")
    ) {
      this.set("lastRegisteredPushPosted", false);
    }

    this.set("lastRegisteredPushToken", token);
    this.set("lastRegisteredPushPlatform", capPlatform);
    this.trigger("pushDeviceTokenRegistered", { token, platform: capPlatform });
    this._registerPushTokenWithApi(token, capPlatform);
  },

  _registerPushTokenWithApi(registrationId, capPlatform) {
    const id = registrationId == null ? "" : String(registrationId).trim();
    if (!id) {
      logWarn(
        "cordova service: skipping POST /auth/register_device: empty registration_id (Azure NH rejects FcmV1RegistrationId eq '')."
      );
      return;
    }

    if (
      id === this.get("lastRegisteredPushToken") &&
      capPlatform === this.get("lastRegisteredPushPlatform") &&
      this.get("lastRegisteredPushPosted")
    ) {
      return;
    }

    const authToken = this.get("session.authToken");
    if (!authToken) {
      logWarn(
        "cordova service: push token received but user is not authenticated; skipping POST /auth/register_device."
      );
      return;
    }

    const platform = pushPlatformForRegisterDeviceApi(capPlatform);
    new AjaxPromise("/auth/register_device", "POST", authToken, {
      registration_id: id,
      platform: platform
    })
      .then(() => {
        this.set("lastRegisteredPushPosted", true);
      })
      .catch(xhr => {
        logError("cordova service: POST /auth/register_device failed", xhr);
      });
  },

  isIOS() {
    let cap;
    try {
      // Prefer Capacitor platform detection when available
      cap = typeof window !== "undefined" ? window.Capacitor : undefined;
      if (cap && typeof cap.getPlatform === "function") {
        return cap.getPlatform() === "ios";
      }
    } catch (e) {
      var debug = console.debug;
      if (Ember.Logger && typeof Ember.Logger.debug === "function") {
        debug = Ember.Logger.debug.bind(Ember.Logger);
      }
      debug("cordova service: isIOS Capacitor platform check failed", e, cap);
    }

    // Do not treat Mobile Safari as "native iOS" for Cordova-era flows unless we
    // are actually running in a legacy native shell (Cordova) or an explicit
    // legacy escape hatch is enabled.
    const legacyCordova =
      typeof window !== "undefined" && typeof window.cordova !== "undefined";
    let root;
    if (typeof globalThis !== "undefined") {
      root = globalThis;
    } else if (typeof window !== "undefined") {
      root = window;
    } else if (typeof global !== "undefined") {
      root = global;
    } else {
      root = undefined;
    }
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

  /**
   * Opens system settings for this app on native Capacitor iOS.
   *
   * Prefer `capacitor-native-settings` (NativeSettings) for a supported path to the
   * app settings screen. If only `@capacitor/app-launcher` is installed, this uses
   * `AppLauncher.canOpenUrl` when available to verify a URL before opening; it does
   * not rely on undocumented `app-settings:` without that check.
   *
   * @returns {Promise<boolean>} true when settings were opened successfully
   */
  openIosAppSettings() {
    if (!isNativeCapacitorShell()) {
      return Ember.RSVP.resolve(false);
    }

    const cap = (typeof window !== "undefined" && window.Capacitor) || null;
    if (
      !cap ||
      typeof cap.getPlatform !== "function" ||
      cap.getPlatform() !== "ios"
    ) {
      return Ember.RSVP.resolve(false);
    }

    const nativeSettings = getNativeSettingsPlugin();
    if (nativeSettings && typeof nativeSettings.openIOS === "function") {
      return Ember.RSVP.resolve()
        .then(() => nativeSettings.openIOS({ option: "app" }))
        .then(res => !!(res && res.status === true))
        .catch(e => {
          logError("cordova service: NativeSettings.openIOS failed", e);
          return false;
        });
    }
    if (nativeSettings && typeof nativeSettings.open === "function") {
      return Ember.RSVP.resolve()
        .then(() =>
          nativeSettings.open({
            optionIOS: "app"
          })
        )
        .then(res => !!(res && res.status === true))
        .catch(e => {
          logError("cordova service: NativeSettings.open failed", e);
          return false;
        });
    }

    const launcher = getAppLauncherPlugin();
    if (!launcher || typeof launcher.openUrl !== "function") {
      logError(
        "cordova service: openIosAppSettings: add capacitor-native-settings and sync, or install @capacitor/app-launcher with canOpenUrl support. Without NativeSettings, iOS cannot open settings reliably from the web layer."
      );
      return Ember.RSVP.resolve(false);
    }

    const settingsUrl = "app-settings:";
    if (typeof launcher.canOpenUrl !== "function") {
      logError(
        "cordova service: openIosAppSettings: AppLauncher.canOpenUrl is missing; add capacitor-native-settings (recommended) or upgrade @capacitor/app-launcher so URL schemes can be verified before open."
      );
      return Ember.RSVP.resolve(false);
    }

    return Ember.RSVP.resolve()
      .then(() => launcher.canOpenUrl({ url: settingsUrl }))
      .then(can => {
        if (!can || can.value !== true) {
          logError(
            "cordova service: openIosAppSettings: URL not supported by AppLauncher; add capacitor-native-settings and run npx cap sync."
          );
          return false;
        }
        return launcher
          .openUrl({ url: settingsUrl })
          .then(({ completed }) => completed === true);
      })
      .catch(e => {
        logError("cordova service: openIosAppSettings failed", e);
        return false;
      });
  },

  verifyIosNotificationSetting(onEnabled, onDisabled) {
    // Check (and request) notification permission via @capacitor/push-notifications
    // on native shells. In the browser, behave as disabled without noisy logs.
    if (!isNativeCapacitorShell()) {
      if (typeof onDisabled === "function") {
        onDisabled();
      }
      return;
    }

    const push = getPushNotificationsPlugin();
    if (!push || typeof push.checkPermissions !== "function") {
      logError(
        "cordova service: Capacitor PushNotifications is missing or invalid. Install @capacitor/push-notifications and run cap sync."
      );
      if (typeof onDisabled === "function") {
        onDisabled();
      }
      return;
    }

    Ember.RSVP.resolve()
      .then(() => push.checkPermissions())
      .then(perms => {
        if (perms && perms.receive === "prompt") {
          return Ember.RSVP.resolve(push.requestPermissions()).then(() =>
            push.checkPermissions()
          );
        }
        return perms;
      })
      .then(perms => {
        if (perms && perms.receive === "granted") {
          if (typeof onEnabled === "function") {
            onEnabled();
          }
        } else if (typeof onDisabled === "function") {
          onDisabled();
        }
      })
      .catch(e => {
        logError("cordova service: verifyIosNotificationSetting failed", e);
        if (typeof onDisabled === "function") {
          onDisabled();
        }
      });
  },

  initiatePushNotifications() {
    if (!isNativeCapacitorShell()) {
      logWarn(
        "cordova service: initiatePushNotifications called outside a native Capacitor shell; skipping."
      );
      return;
    }

    const push = getPushNotificationsPlugin();
    if (
      !push ||
      typeof push.checkPermissions !== "function" ||
      typeof push.requestPermissions !== "function" ||
      typeof push.addListener !== "function" ||
      typeof push.register !== "function"
    ) {
      logError(
        "cordova service: initiatePushNotifications: PushNotifications plugin missing or invalid (need checkPermissions, requestPermissions, addListener, and register)."
      );
      return;
    }

    Ember.RSVP.resolve()
      .then(() => push.checkPermissions())
      .then(perms => {
        if (perms && perms.receive === "prompt") {
          return Ember.RSVP.resolve(push.requestPermissions()).then(() =>
            push.checkPermissions()
          );
        }
        return perms;
      })
      .then(perms => {
        if (!perms || perms.receive !== "granted") {
          logWarn(
            "cordova service: initiatePushNotifications: permission not granted (receive=" +
              (perms && perms.receive ? perms.receive : "unknown") +
              "); skipping push.register."
          );
          return null;
        }
        return this._ensurePushRegistrationListeners(push).then(() => perms);
      })
      .then(perms => {
        if (!perms) {
          return;
        }
        if (!this.get("_pushRegistrationListenersAttached")) {
          logError(
            "cordova service: initiatePushNotifications: push listeners not attached; skipping register."
          );
          return;
        }
        return Ember.RSVP.resolve(push.register()).catch(regErr => {
          logError(
            "cordova service: initiatePushNotifications: push.register failed",
            regErr
          );
        });
      })
      .catch(e => {
        logError("cordova service: initiatePushNotifications failed", e);
      });
  },

  appLoad() {
    // Push registration is intentionally not run on app start. We only attempt it
    // after login (see session.authToken observer) or explicit user action.
  }
});
