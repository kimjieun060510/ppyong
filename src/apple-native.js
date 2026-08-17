import { Capacitor } from "@capacitor/core";
import { SignInWithApple } from "@capacitor-community/apple-sign-in";

window.PpyongApple = {
  isNative() {
    return Capacitor.isNativePlatform();
  },
  async signIn() {
    return SignInWithApple.authorize({
      clientId: "com.kimjieun.ppyong",
      scopes: "email name",
    });
  },
};
