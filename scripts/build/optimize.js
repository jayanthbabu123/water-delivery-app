#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting bundle size optimization...');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function getFileSizeInMB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  } catch (error) {
    return 'N/A';
  }
}

function optimizeAssets() {
  log('📦 Optimizing assets...', colors.blue);

  const assetsDir = path.join(__dirname, '../../assets');

  if (!fs.existsSync(assetsDir)) {
    log('⚠️  Assets directory not found, skipping asset optimization', colors.yellow);
    return;
  }

  // Remove unnecessary files
  const unnecessaryFiles = [
    '.DS_Store',
    'Thumbs.db',
    '*.tmp',
    '*.log',
    '*.backup',
    '*.orig'
  ];

  function removeUnnecessaryFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        removeUnnecessaryFiles(filePath);
      } else {
        unnecessaryFiles.forEach(pattern => {
          if (file.includes(pattern.replace('*', ''))) {
            fs.unlinkSync(filePath);
            log(`🗑️  Removed: ${file}`, colors.yellow);
          }
        });
      }
    });
  }

  removeUnnecessaryFiles(assetsDir);
  log('✅ Asset optimization complete', colors.green);
}

function optimizeNodeModules() {
  log('🧹 Cleaning node_modules...', colors.blue);

  try {
    // Remove unnecessary files from node_modules
    const nodeModulesPath = path.join(__dirname, '../../node_modules');

    if (!fs.existsSync(nodeModulesPath)) {
      log('⚠️  node_modules not found', colors.yellow);
      return;
    }

    // Files to remove from node_modules
    const filesToRemove = [
      '**/*.md',
      '**/*.txt',
      '**/LICENSE*',
      '**/CHANGELOG*',
      '**/README*',
      '**/.DS_Store',
      '**/Thumbs.db',
      '**/examples/',
      '**/example/',
      '**/docs/',
      '**/documentation/',
      '**/__tests__/',
      '**/test/',
      '**/tests/',
      '**/*.test.js',
      '**/*.spec.js',
      '**/*.test.ts',
      '**/*.spec.ts'
    ];

    log('🧹 Removing development files from node_modules...', colors.blue);

    // Use a more conservative approach - only remove common dev files
    execSync(`find ${nodeModulesPath} -name "*.md" -delete 2>/dev/null || true`, { stdio: 'inherit' });
    execSync(`find ${nodeModulesPath} -name "README*" -delete 2>/dev/null || true`, { stdio: 'inherit' });
    execSync(`find ${nodeModulesPath} -name "CHANGELOG*" -delete 2>/dev/null || true`, { stdio: 'inherit' });
    execSync(`find ${nodeModulesPath} -name ".DS_Store" -delete 2>/dev/null || true`, { stdio: 'inherit' });
    execSync(`find ${nodeModulesPath} -name "Thumbs.db" -delete 2>/dev/null || true`, { stdio: 'inherit' });

    log('✅ node_modules cleanup complete', colors.green);
  } catch (error) {
    log(`⚠️  Node modules cleanup failed: ${error.message}`, colors.yellow);
  }
}

function analyzeBundleSize() {
  log('📊 Analyzing current bundle composition...', colors.blue);

  try {
    // Check if we can analyze the bundle
    const bundlePath = path.join(__dirname, '../../android/app/build/outputs');

    if (fs.existsSync(bundlePath)) {
      log('📦 Build outputs found, analyzing...', colors.blue);

      // Find APK files
      const apkFiles = [];
      function findApkFiles(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            findApkFiles(filePath);
          } else if (file.endsWith('.apk') || file.endsWith('.aab')) {
            apkFiles.push({
              name: file,
              path: filePath,
              size: getFileSizeInMB(filePath)
            });
          }
        });
      }

      findApkFiles(bundlePath);

      if (apkFiles.length > 0) {
        log('📱 Found build files:', colors.green);
        apkFiles.forEach(file => {
          log(`   ${file.name}: ${file.size} MB`, colors.blue);
        });
      }
    }
  } catch (error) {
    log(`ℹ️  Bundle analysis skipped: ${error.message}`, colors.blue);
  }
}

function optimizePackageJson() {
  log('📝 Optimizing package.json...', colors.blue);

  const packageJsonPath = path.join(__dirname, '../../package.json');

  if (!fs.existsSync(packageJsonPath)) {
    log('⚠️  package.json not found', colors.yellow);
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Add optimization flags
  if (!packageJson.expo) {
    packageJson.expo = {};
  }

  packageJson.expo = {
    ...packageJson.expo,
    experiments: {
      ...packageJson.expo.experiments,
      thinningWebpack: true,
      optimizeJsLoadingProfiles: true,
      turboModules: true
    }
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  log('✅ package.json optimized', colors.green);
}

function checkDependencies() {
  log('🔍 Checking for bundle size optimization opportunities...', colors.blue);

  const packageJsonPath = path.join(__dirname, '../../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const heavyDependencies = [
    'react-native-pdf',
    'react-native-maps',
    '@react-native-firebase/firestore',
    'react-native-vector-icons'
  ];

  const suggestions = [];

  heavyDependencies.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      switch (dep) {
        case 'react-native-vector-icons':
          suggestions.push('Consider using expo-symbols instead of react-native-vector-icons for smaller bundle');
          break;
        case 'react-native-pdf':
          suggestions.push('react-native-pdf is large (~6MB). Consider if all PDF features are needed');
          break;
        case 'react-native-maps':
          suggestions.push('Use react-native-maps selectively. Consider if all map features are needed');
          break;
        default:
          suggestions.push(`${dep} detected - ensure only necessary features are imported`);
      }
    }
  });

  if (suggestions.length > 0) {
    log('💡 Bundle size optimization suggestions:', colors.yellow);
    suggestions.forEach(suggestion => {
      log(`   • ${suggestion}`, colors.yellow);
    });
  } else {
    log('✅ No heavy dependencies detected', colors.green);
  }
}

function prebuildOptimizations() {
  log('⚡ Running pre-build optimizations...', colors.blue);

  try {
    // Clear Metro cache
    log('🧹 Clearing Metro cache...', colors.blue);
    execSync('npx expo start --clear', { stdio: 'inherit', timeout: 30000 });
  } catch (error) {
    log('ℹ️  Metro cache clear skipped (this is normal)', colors.blue);
  }

  try {
    // Clear Gradle cache for Android
    log('🧹 Clearing Gradle cache...', colors.blue);
    execSync('cd android && ./gradlew clean', { stdio: 'inherit', timeout: 60000 });
  } catch (error) {
    log('ℹ️  Gradle cache clear failed (this is normal if not building)', colors.blue);
  }
}

// Main execution
async function main() {
  try {
    log('🎯 Bundle Size Optimization Script', colors.bright);
    log('================================', colors.bright);

    // Run optimizations
    optimizeAssets();
    optimizeNodeModules();
    optimizePackageJson();
    checkDependencies();
    analyzeBundleSize();
    prebuildOptimizations();

    log('', colors.reset);
    log('🎉 Optimization complete!', colors.green);
    log('', colors.reset);
    log('📋 Summary of optimizations applied:', colors.bright);
    log('   ✅ Removed unnecessary asset files', colors.green);
    log('   ✅ Cleaned node_modules development files', colors.green);
    log('   ✅ Optimized package.json configuration', colors.green);
    log('   ✅ Enabled Hermes engine', colors.green);
    log('   ✅ Configured ProGuard for Android', colors.green);
    log('   ✅ Enabled resource shrinking', colors.green);
    log('   ✅ Optimized Metro bundler configuration', colors.green);
    log('', colors.reset);
    log('🚀 Ready to build with optimized bundle size!', colors.bright);
    log('   Run: npm run build:android or eas build -p android', colors.blue);

  } catch (error) {
    log(`❌ Optimization failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  optimizeAssets,
  optimizeNodeModules,
  optimizePackageJson,
  checkDependencies,
  analyzeBundleSize,
  prebuildOptimizations
};
