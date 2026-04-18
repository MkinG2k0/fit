import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fit.myapp",
  appName: "fit",
  webDir: "dist",
  server: {
    url: "http://192.168.0.199:5173",
    cleartext: true,
  },
};

export default config;
