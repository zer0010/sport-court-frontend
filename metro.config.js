// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Custom resolver for web platform only
if (config.resolver) {
  const originalResolveRequest = config.resolver.resolveRequest;

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // Only apply aliases for web platform
    if (platform === 'web') {
      // Alias react-native to react-native-web
      if (moduleName === 'react-native') {
        return context.resolveRequest(context, 'react-native-web', platform);
      }

      // Mock codegenNativeCommands for react-native-maps on web
      if (moduleName === 'react-native/Libraries/Utilities/codegenNativeCommands') {
        return {
          filePath: require.resolve('./mocks/codegenNativeCommands.js'),
          type: 'sourceFile',
        };
      }
    }

    // Let Metro handle all other requests normally
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
