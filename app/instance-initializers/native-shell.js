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

      if (
        typeof window !== "undefined" &&
        typeof window.Capacitor !== "undefined"
      ) {
        const { container = app } = app;
        const cordova = container.lookup("service:cordova");
        if (cordova && typeof cordova.appLoad === "function") {
          cordova.appLoad();
        }
      }
    } catch (e) {
      // Best-effort only: never block app startup on this.
    }
  }
};
