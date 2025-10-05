import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.exoplanethunter',
  appName: 'ExoplanetHunter',
  webDir: 'dist',
  server: {
    url: "http://192.168.1.44:3000", // eller "http://10.0.2.2:5173" för emulator
    cleartext: true
  }
};

export default config;