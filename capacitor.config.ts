import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.astratech.ordemservico",
  appName: "Astra | OS",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
