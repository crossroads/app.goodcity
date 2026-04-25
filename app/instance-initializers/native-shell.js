export default {
  name: "native-shell",
  initialize(app) {
    try {
      // Capacitor defines `window.Capacitor`; Cordova defines `window.cordova`.
      const isNativeShell =
        typeof window !== "undefined" &&
        (typeof window.Capacitor !== "undefined" ||
          typeof window.cordova !== "undefined");

      if (isNativeShell && document && document.documentElement) {
        document.documentElement.classList.add("is-native-shell");
      }

      // Ensure the cordova service is instantiated early so its session.authToken
      // observer can react immediately after login. This does NOT trigger any push
      // prompt on app start; the service only requests permissions after auth or
      // explicit user action.
      if (
        typeof window !== "undefined" &&
        typeof window.Capacitor !== "undefined"
      ) {
        const { container = app } = app;
        container.lookup("service:cordova");
      }
    } catch (e) {
      // Best-effort only: never block app startup on this.
    }
  }
};
