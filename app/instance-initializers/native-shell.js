export default {
  name: "native-shell",
  initialize() {
    try {
      // Capacitor defines `window.Capacitor`; Cordova defines `window.cordova`.
      const isNativeShell =
        typeof window !== "undefined" &&
        (typeof window.Capacitor !== "undefined" ||
          typeof window.cordova !== "undefined");

      if (isNativeShell && document && document.documentElement) {
        document.documentElement.classList.add("is-native-shell");
      }
    } catch (e) {
      // Best-effort only: never block app startup on this.
    }
  }
};
