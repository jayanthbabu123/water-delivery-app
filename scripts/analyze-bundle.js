#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("📊 Bundle Size Analyzer");
console.log("=====================\n");

// Colors for output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Analyze node_modules size
function analyzeNodeModules() {
  log("\n🔍 Analyzing node_modules dependencies...", colors.blue);

  const nodeModulesPath = path.join(__dirname, "../node_modules");
  if (!fs.existsSync(nodeModulesPath)) {
    log("❌ node_modules not found", colors.red);
    return;
  }

  const dependencies = [];

  try {
    const dirs = fs.readdirSync(nodeModulesPath);

    dirs.forEach((dir) => {
      if (dir.startsWith(".")) return;

      const depPath = path.join(nodeModulesPath, dir);
      if (!fs.statSync(depPath).isDirectory()) return;

      try {
        const size = getDirSize(depPath);
        dependencies.push({ name: dir, size, path: depPath });
      } catch (error) {
        // Skip if we can't read the directory
      }
    });

    // Sort by size (largest first)
    dependencies.sort((a, b) => b.size - a.size);

    log("\n📦 Top 20 Largest Dependencies:", colors.bold);
    log("================================", colors.bold);

    dependencies.slice(0, 20).forEach((dep, index) => {
      const sizeStr = formatBytes(dep.size);
      const color =
        dep.size > 10 * 1024 * 1024
          ? colors.red
          : dep.size > 5 * 1024 * 1024
            ? colors.yellow
            : colors.green;
      log(`${index + 1}. ${dep.name.padEnd(35)} ${sizeStr}`, color);
    });

    const totalSize = dependencies.reduce((sum, dep) => sum + dep.size, 0);
    log(`\n📊 Total node_modules size: ${formatBytes(totalSize)}`, colors.cyan);

    // Identify problematic dependencies
    log("\n🚨 Bundle Size Culprits (>5MB):", colors.red);
    const heavyDeps = dependencies.filter((dep) => dep.size > 5 * 1024 * 1024);

    if (heavyDeps.length === 0) {
      log("✅ No dependencies over 5MB found", colors.green);
    } else {
      heavyDeps.forEach((dep) => {
        log(`   • ${dep.name}: ${formatBytes(dep.size)}`, colors.red);
      });
    }
  } catch (error) {
    log(`❌ Error analyzing node_modules: ${error.message}`, colors.red);
  }
}

function getDirSize(dirPath) {
  let size = 0;

  try {
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
      const itemPath = path.join(dirPath, item);
      try {
        const stats = fs.statSync(itemPath);

        if (stats.isFile()) {
          size += stats.size;
        } else if (stats.isDirectory()) {
          size += getDirSize(itemPath);
        }
      } catch (error) {
        // Skip files/dirs we can't access
      }
    });
  } catch (error) {
    // Skip directories we can't read
  }

  return size;
}

// Analyze package.json dependencies
function analyzeDependencies() {
  log("\n📋 Dependency Analysis:", colors.blue);

  const packageJsonPath = path.join(__dirname, "../package.json");
  if (!fs.existsSync(packageJsonPath)) {
    log("❌ package.json not found", colors.red);
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const deps = packageJson.dependencies || {};

  // Known heavy dependencies
  const heavyDeps = {
    "react-native-pdf": "6-7MB",
    "react-native-maps": "4-5MB",
    "react-native-vector-icons": "3-4MB",
    "react-native-elements": "2-3MB",
    "@react-native-firebase/firestore": "3-4MB",
    "@react-native-firebase/storage": "2-3MB",
    "@react-native-firebase/auth": "2-3MB",
    "react-native-reanimated": "2-3MB",
    "@stripe/stripe-react-native": "2-3MB",
  };

  log("\n🎯 Bundle Impact Analysis:", colors.bold);
  log("===========================", colors.bold);

  let totalEstimatedSize = 0;

  Object.keys(deps).forEach((dep) => {
    if (heavyDeps[dep]) {
      log(`❗ ${dep.padEnd(40)} ~${heavyDeps[dep]}`, colors.red);
      totalEstimatedSize +=
        parseFloat(heavyDeps[dep].split("-")[0]) * 1024 * 1024;
    }
  });

  log(
    `\n📊 Estimated heavy dependencies: ~${formatBytes(totalEstimatedSize)}`,
    colors.cyan,
  );

  // Suggestions
  log("\n💡 Optimization Suggestions:", colors.yellow);
  log("============================", colors.yellow);

  if (deps["react-native-vector-icons"]) {
    log(
      "• Replace react-native-vector-icons with @expo/vector-icons (saves ~3MB)",
      colors.yellow,
    );
  }

  if (deps["react-native-elements"]) {
    log(
      "• Replace react-native-elements with native components (saves ~2-3MB)",
      colors.yellow,
    );
  }

  if (deps["react-native-pdf"]) {
    log("• Consider if PDF viewing is essential (saves ~6-7MB)", colors.yellow);
  }

  if (Object.keys(deps).filter((d) => d.includes("firebase")).length > 3) {
    log(
      "• Remove unused Firebase modules (saves ~2-3MB per module)",
      colors.yellow,
    );
  }
}

// Analyze assets
function analyzeAssets() {
  log("\n📁 Assets Analysis:", colors.blue);

  const assetsPath = path.join(__dirname, "../assets");
  if (!fs.existsSync(assetsPath)) {
    log("❌ Assets folder not found", colors.red);
    return;
  }

  const assetsSize = getDirSize(assetsPath);
  log(`📊 Total assets size: ${formatBytes(assetsSize)}`, colors.cyan);

  if (assetsSize > 1024 * 1024) {
    // > 1MB
    log("⚠️  Assets are large, consider optimization:", colors.yellow);
    log("  • Compress images", colors.yellow);
    log("  • Use WebP format", colors.yellow);
    log("  • Remove unused assets", colors.yellow);
  } else {
    log("✅ Assets size is reasonable", colors.green);
  }
}

// Check APK files
function checkBuilds() {
  log("\n📱 Build Analysis:", colors.blue);

  const buildPath = path.join(__dirname, "../android/app/build/outputs");
  if (!fs.existsSync(buildPath)) {
    log("ℹ️  No builds found yet", colors.blue);
    return;
  }

  try {
    const findApks = (dir) => {
      const files = [];
      const items = fs.readdirSync(dir);

      items.forEach((item) => {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          files.push(...findApks(itemPath));
        } else if (item.endsWith(".apk") || item.endsWith(".aab")) {
          files.push({
            name: item,
            path: itemPath,
            size: stats.size,
          });
        }
      });

      return files;
    };

    const builds = findApks(buildPath);

    if (builds.length === 0) {
      log("ℹ️  No APK/AAB files found", colors.blue);
      return;
    }

    log("\n📦 Built APK/AAB Files:", colors.bold);
    log("======================", colors.bold);

    builds.forEach((build) => {
      const sizeStr = formatBytes(build.size);
      const color =
        build.size > 50 * 1024 * 1024
          ? colors.red
          : build.size > 25 * 1024 * 1024
            ? colors.yellow
            : colors.green;
      log(`📱 ${build.name}: ${sizeStr}`, color);
    });
  } catch (error) {
    log(`❌ Error checking builds: ${error.message}`, colors.red);
  }
}

// Recommendations
function showRecommendations() {
  log("\n🎯 Optimization Recommendations:", colors.bold);
  log("=================================", colors.bold);

  log("\n1. Enable ABI Splits:", colors.green);
  log("   • Can reduce size by 50-70%", colors.white);
  log("   • Build separate APKs for arm64-v8a and armeabi-v7a", colors.white);

  log("\n2. Replace Heavy Dependencies:", colors.green);
  log("   • react-native-vector-icons → @expo/vector-icons", colors.white);
  log("   • react-native-elements → native components", colors.white);
  log("   • Consider removing react-native-pdf if not essential", colors.white);

  log("\n3. Firebase Optimization:", colors.green);
  log("   • Remove unused Firebase modules", colors.white);
  log("   • Use only specific Firebase features needed", colors.white);

  log("\n4. ProGuard/R8 Configuration:", colors.green);
  log("   • Enable aggressive minification", colors.white);
  log("   • Remove unused code", colors.white);

  log("\n5. Metro Bundler Optimization:", colors.green);
  log("   • Tree shaking for unused exports", colors.white);
  log("   • Exclude test files and documentation", colors.white);
}

// Main execution
async function main() {
  try {
    analyzeNodeModules();
    analyzeDependencies();
    analyzeAssets();
    checkBuilds();
    showRecommendations();

    log("\n✅ Analysis complete!", colors.green);
  } catch (error) {
    log(`❌ Analysis failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeNodeModules,
  analyzeDependencies,
  analyzeAssets,
  checkBuilds,
  showRecommendations,
};
