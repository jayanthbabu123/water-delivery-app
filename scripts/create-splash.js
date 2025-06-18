const fs = require("fs");
const path = require("path");

// Create directory if it doesn't exist
const assetsDir = path.join(__dirname, "..", "assets");
const imagesDir = path.join(assetsDir, "images");

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Create all the required placeholder images
const createPlaceholderImage = (filename, size) => {
  // Create a simple 1x1 pixel transparent PNG
  const transparentPixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64",
  );

  // Write the placeholder to the file
  fs.writeFileSync(path.join(imagesDir, filename), transparentPixel);
  console.log(`Created placeholder image: ${filename}`);
};

// Create all required images
createPlaceholderImage("splash.png");
createPlaceholderImage("icon.png");
createPlaceholderImage("adaptive-icon.png");
createPlaceholderImage("favicon.png");

console.log("All placeholder images created successfully in assets/images/");

// Now restore the app.json with minimal configuration
const appJsonPath = path.join(__dirname, "..", "app.json");
const appJson = {
  expo: {
    name: "WaterDeliveryApp",
    slug: "WaterDeliveryApp",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.waterdelivery.app",
      buildNumber: "1.0.0",
    },
    android: {
      package: "com.waterdelivery.app",
      versionCode: 1,
    },
    web: {
      bundler: "metro",
    },
    plugins: ["expo-router"],
  },
};

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
console.log("Updated app.json with minimal configuration");
