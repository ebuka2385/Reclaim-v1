import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    expo: {
      name: 'Reclaim',
      slug: 'reclaim',
      version: '1.0.0',
      orientation: 'portrait',
      userInterfaceStyle: 'light',
      ios: {
        supportsTablet: true,
        bundleIdentifier: 'app.reclaim.mobile',
        infoPlist: {
          ITSAppUsesNonExemptEncryption: false,
        },
      },
      android: {
        package: 'app.reclaim.mobile',
        permissions: [
          'android.permission.ACCESS_COARSE_LOCATION',
          'android.permission.ACCESS_FINE_LOCATION',
        ],
      },
      plugins: [], // do NOT add expo-location here
      extra: {
        eas: {
          projectId: '7d040fd8-4f45-4c5e-982f-5517e8031e54',
        },
      },
      owner: 'ethanlma',
    },
  };
};
