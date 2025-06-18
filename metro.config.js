// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Optimize for production builds
config.transformer.minifierConfig = {
  compress: {
    // Remove console.* statements in production
    drop_console: true,
    // Remove unused code and dead code
    dead_code: true,
    // Collapse statements that will evaluate to the same value
    collapse_vars: true,
    // Remove unreachable code
    unused: true,
    // Convert if/return patterns to ternary expressions
    if_return: true,
  },
  mangle: {
    // Mangle variable and function names for smaller bundles
    toplevel: true,
  },
};

// Exclude dev modules from the bundle
config.resolver.blockList = [
  /\.\/node_modules\/react-native\/.*\/__tests__\/.*/,
  /\.\/node_modules\/react-native\/.*\/jest\/.*/,
];

// Optimize serialization
config.serializer = {
  ...config.serializer,
  createModuleIdFactory: () => {
    // Use a numeric ID based on a hash for smaller bundle size
    const fileToIdMap = new Map();
    let nextId = 0;

    return (path) => {
      if (fileToIdMap.has(path)) {
        return fileToIdMap.get(path);
      }

      const id = nextId;
      nextId += 1;
      fileToIdMap.set(path, id);
      return id;
    };
  },
};

module.exports = config;
