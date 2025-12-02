module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|react-navigation|@react-native-community|@react-native-picker|react-native-svg|react-native-vector-icons|react-native-gesture-handler|react-native-reanimated|react-native-safe-area-context|react-native-screens|@react-native-async-storage|@react-native-community/netinfo|react-native-maps|react-native-geolocation-service|react-native-permissions|react-native-image-picker|react-native-document-picker|react-native-fs|react-native-share|react-native-webview|react-native-device-info|react-native-keychain|react-native-biometrics|react-native-camera|react-native-qrcode-scanner|react-native-barcode-scanner|react-native-sound|react-native-audio-recorder-player|react-native-video|react-native-image-crop-picker|react-native-image-resizer|react-native-image-viewing|react-native-lightbox|react-native-modal|react-native-super-grid|react-native-swipe-gestures|react-native-swiper|react-native-tab-view|react-native-pager-view|react-native-snap-carousel|react-native-parallax-scroll-view|react-native-scrollable-tab-view|react-native-tab-navigator|react-native-drawer|react-native-side-menu|react-native-sliding-up-panel|react-native-slider|react-native-switch|react-native-toggle|react-native-checkbox|react-native-radio-button|react-native-segmented-control|react-native-picker-select|react-native-datetimepicker|react-native-calendars|react-native-charts|react-native-chart-kit|react-native-svg-charts|react-native-progress|react-native-loading-spinner-overlay|react-native-spinkit|react-native-activity-indicator|react-native-indicators|react-native-elements|react-native-ui-lib|react-native-paper|react-native-elements|react-native-vector-icons|react-native-ratings|react-native-star-rating|react-native-super-grid|react-native-swipe-gestures|react-native-swiper|react-native-tab-view|react-native-pager-view|react-native-snap-carousel|react-native-parallax-scroll-view|react-native-scrollable-tab-view|react-native-tab-navigator|react-native-drawer|react-native-side-menu|react-native-sliding-up-panel|react-native-slider|react-native-switch|react-native-toggle|react-native-checkbox|react-native-radio-button|react-native-segmented-control|react-native-picker-select|react-native-datetimepicker|react-native-calendars|react-native-charts|react-native-chart-kit|react-native-svg-charts|react-native-progress|react-native-loading-spinner-overlay|react-native-spinkit|react-native-activity-indicator|react-native-indicators|react-native-elements|react-native-ui-lib|react-native-paper|react-native-elements|react-native-vector-icons|react-native-ratings|react-native-star-rating)/)',
  ],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/node_modules/react-native',
  },
};
