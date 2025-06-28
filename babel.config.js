module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
          },
          extensions: [
            ".ios.ts",
            ".android.ts",
            ".native.ts",
            ".ts",
            ".ios.tsx",
            ".android.tsx",
            ".native.tsx",
            ".tsx",
            ".ios.js",
            ".android.js",
            ".native.js",
            ".js",
            ".ios.jsx",
            ".android.jsx",
            ".native.jsx",
            ".jsx",
            ".json",
          ],
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
