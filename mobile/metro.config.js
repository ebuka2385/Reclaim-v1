const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure react-dom mock for Clerk
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-dom': require.resolve('./react-dom-mock.js'),
};

module.exports = config;

