import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.villena.fiestas',
  appName: 'Villena Fiestas',
  webDir: 'dist',
  plugins: {
    // Solo usamos Google — sin esto, @capgo/capacitor-social-login incluye
    // también los SDKs nativos de Facebook/Apple/Twitter sin necesidad,
    // engordando el APK/IPA de más.
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false,
      },
    },
  },
};

export default config;
