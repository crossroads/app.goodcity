/* jshint esversion: 8, esnext: false */
/* global globalThis, global, process */

import Ember from "ember";
import AjaxPromise from "../utils/ajax-promise";
const { getOwner } = Ember;

function logError(message, error) {
  if (Ember.Logger && typeof Ember.Logger.error === "function") {
    Ember.Logger.error(message, JSON.stringify(error));
  } else {
    console.error(message, JSON.stringify(error));
  }
}

function logWarn(message, data) {
  if (Ember.Logger && typeof Ember.Logger.warn === "function") {
    Ember.Logger.warn(message, JSON.stringify(data));
  } else {
    console.warn(message, JSON.stringify(data));
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
    return "aps";
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
  store: Ember.inject.service(),
  messagesUtil: Ember.inject.service("messages"),

  init() {
    this._super(...arguments);
    this.lastRegisteredPushToken = null;
    this.lastRegisteredPushPlatform = null;
    this.lastRegisteredPushPosted = false;
    this._pushRegistrationListenersAttached = false;
    this._pushRegistrationTearDown = null;
    const session = this.get("session");
    if (session && typeof session.addObserver === "function") {
      session.addObserver("authToken", this, "_onSessionAuthTokenChanged");
      if (session.get("authToken")) {
        Ember.run.once(this, "_onSessionAuthTokenChanged");
      }
    }
  },

  willDestroy() {
    this._super(...arguments);
    const session = this.get("session");
    if (session && typeof session.removeObserver === "function") {
      session.removeObserver("authToken", this, "_onSessionAuthTokenChanged");
    }
    const tearDown = this._pushRegistrationTearDown;
    if (typeof tearDown === "function") {
      Ember.RSVP.resolve(tearDown())
        .catch(() => {})
        .finally(() => {
          this._pushRegistrationTearDown = null;
          this._pushRegistrationListenersAttached = false;
        });
    }
  },

  _ensurePushRegistrationListeners(push) {
    if (this._pushRegistrationListenersAttached) {
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
    let notificationActionHandle;
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
        this._pushRegistrationTearDown = tearDown;
        return push.addListener("registrationError", err => {
          Ember.run(this, function() {
            this._onPushRegistrationError(err);
          });
        });
      })
      .then(handle => {
        registrationErrorHandle = handle;
        return push.addListener("pushNotificationActionPerformed", data => {
          Ember.run(this, function() {
            this._processTappedNotification(data);
          });
        });
      })
      .then(handle => {
        notificationActionHandle = handle;

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
            if (
              notificationActionHandle &&
              typeof notificationActionHandle.remove === "function"
            ) {
              removals.push(notificationActionHandle.remove());
            }
          } catch (e) {
            logWarn("cordova service: push listener teardown failed");
          }
          return Ember.RSVP.all(removals).catch(() => {});
        };
        this._pushRegistrationTearDown = tearDown;
        this._pushRegistrationListenersAttached = true;
      })
      .catch(e => {
        logError("cordova service: PushNotifications addListener failed", e);
        const tearDown = this._pushRegistrationTearDown;
        if (typeof tearDown === "function") {
          Ember.RSVP.resolve(tearDown())
            .catch(() => {})
            .finally(() => {
              Ember.run(this, function() {
                this._pushRegistrationTearDown = null;
                this._pushRegistrationListenersAttached = false;
              });
              registrationHandle = undefined;
              registrationErrorHandle = undefined;
              notificationActionHandle = undefined;
            });
        } else {
          Ember.run(this, function() {
            this._pushRegistrationListenersAttached = false;
          });
          registrationHandle = undefined;
          registrationErrorHandle = undefined;
          notificationActionHandle = undefined;
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
      token === this.lastRegisteredPushToken &&
      capPlatform === this.lastRegisteredPushPlatform &&
      this.lastRegisteredPushPosted
    ) {
      return;
    }

    if (
      token !== this.lastRegisteredPushToken ||
      capPlatform !== this.lastRegisteredPushPlatform
    ) {
      this.lastRegisteredPushPosted = false;
    }

    this.lastRegisteredPushToken = token;
    this.lastRegisteredPushPlatform = capPlatform;
    this.trigger("pushDeviceTokenRegistered", { token, platform: capPlatform });
    this._registerPushTokenWithApi(token, capPlatform);
  },

  _registerPushTokenWithApi(registrationId, capPlatform) {
    const handle = registrationId == null ? "" : String(registrationId).trim();
    if (!handle) {
      logWarn(
        "cordova service: skipping POST /auth/register_device: empty handle (Azure NH rejects FcmV1RegistrationId eq '')."
      );
      return;
    }

    if (
      handle === this.lastRegisteredPushToken &&
      capPlatform === this.lastRegisteredPushPlatform &&
      this.lastRegisteredPushPosted
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
    logWarn("cordova service: POST /auth/register_device", {
      platform: platform,
      handle_prefix: handle.slice(0, 12),
      handle_length: handle.length
    });
    new AjaxPromise("/auth/register_device", "POST", authToken, {
      handle: handle,
      platform: platform
    })
      .then(() => {
        this.lastRegisteredPushPosted = true;
      })
      .catch(xhr => {
        logError("cordova service: POST /auth/register_device failed", xhr);
      });
  },

  _notificationPayloadFromAction(data) {
    if (!data) {
      return null;
    }
    const notification = data.notification || data;
    const payload =
      (notification.data && notification.data.payload) ||
      notification.data ||
      notification.payload ||
      notification;
    if (typeof payload === "string") {
      try {
        return JSON.parse(payload);
      } catch (e) {
        return null;
      }
    }
    return payload;
  },

  _processTappedNotification(data) {
    const payload = this._notificationPayloadFromAction(data);
    if (!payload || !payload.category) {
      logWarn(
        "cordova service: pushNotificationActionPerformed without usable payload",
        data
      );
      return;
    }

    const notifications = getOwner(this).lookup("controller:notifications");
    if (!notifications) {
      logWarn("cordova service: controller:notifications missing");
      return;
    }

    if (payload.category === "incoming_call") {
      notifications.acceptCall(payload);
    }

    notifications.setRoute(payload);

    if (payload.category === "message") {
      const hasMessage = this.get("store").peekRecord(
        "message",
        payload.message_id
      );
      if (hasMessage) {
        notifications.transitionToRoute.apply(notifications, payload.route);
        return;
      }

      const loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      let messageUrl;
      if (payload.item_id) {
        messageUrl = `/messages?item_id=${payload.item_id}`;
      } else {
        messageUrl = `/messages?offer_id=${payload.offer_id}`;
      }
      new AjaxPromise(messageUrl, "GET", this.get("session.authToken"), {})
        .then(data => {
          this.get("store").pushPayload(data);
          notifications.transitionToRoute.apply(notifications, payload.route);
        })
        .finally(() => loadingView.destroy());
      return;
    }

    notifications.transitionToRoute.apply(notifications, payload.route);
  },

  isAndroid() {
    const cap = (typeof window !== "undefined" && window.Capacitor) || null;
    if (cap && typeof cap.getPlatform === "function") {
      return cap.getPlatform() === "android";
    }
    return (
      typeof window !== "undefined" &&
      window.device &&
      ["android", "Android", "amazon-fireos"].indexOf(window.device.platform) >=
        0
    );
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
        if (!this._pushRegistrationListenersAttached) {
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

  // Compatibility no-op for older startup paths. Push registration is triggered
  // after login via session.authToken, not from app start.
  appLoad() {}
});
