// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure path aliases for TypeScript @/ imports
config.resolver.alias = {
  "@": path.resolve(__dirname),
};

// Basic optimization for production builds
config.transformer.minifierConfig = {
  compress: {
    drop_console: true,
    dead_code: true,
    collapse_vars: true,
    unused: true,
    if_return: true,
  },
  mangle: {
    toplevel: true,
  },
};

// Exclude dev modules from the bundle
config.resolver.blockList = [
  /\.\/node_modules\/react-native\/.*\/__tests__\/.*/,
  /\.\/node_modules\/react-native\/.*\/jest\/.*/,
];

// Optimize serializer
config.serializer = {
  ...config.serializer,
  createModuleIdFactory: () => {
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
