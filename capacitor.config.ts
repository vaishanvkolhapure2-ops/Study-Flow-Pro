import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studyflow.neuralpro',
  appName: 'StudyFlow Neural Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
