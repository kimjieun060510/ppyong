import { Capacitor, registerPlugin } from "@capacitor/core";

const PpyongAppleAuth = registerPlugin("PpyongAppleAuth");

window.PpyongApple = {
  isNative() {
    return Capacitor.isNativePlatform();
  },
  async signIn() {
    return PpyongAppleAuth.authorize();
  },
};
