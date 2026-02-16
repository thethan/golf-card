import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anonymous.golfscorecard',
  appName: 'Golf Scorecard',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SpeechRecognition: {
      language: 'en-US'
    }
  }
};

export default config;

