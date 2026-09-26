import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dogai.app',
  appName: 'DOG AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
