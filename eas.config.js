module.exports = {
  hooks: {
    // Hook runs before installing dependencies with npm
    beforeNpmInstall: async ({ projectDir, platform }) => {
      console.log("⚙️ Running beforeNpmInstall hook...");
      console.log(`Platform: ${platform}, Project directory: ${projectDir}`);
    },

    // Hook runs after installing dependencies but before the build
    beforeBuild: async ({ projectDir, platform }) => {
      console.log("⚙️ Running beforeBuild hook...");
      console.log("Ensuring we're using legacy-peer-deps...");

      // Extra environment variables that will be helpful during the build
      process.env.NODE_OPTIONS = "--max-old-space-size=8192";

      // Log some information about the build environment
      console.log(`Node version: ${process.version}`);
      console.log(`Platform: ${platform}`);
      console.log(`Project directory: ${projectDir}`);
    },

    // Hook runs after the build completes
    afterBuild: async ({ projectDir, platform, buildDetails }) => {
      console.log("✅ Build completed successfully!");
      console.log(`Build artifact: ${buildDetails?.artifactPath || 'Unknown'}`);
    },

    // This hook runs if the build fails
    onBuildError: async ({ error, projectDir, platform }) => {
      console.error("❌ Build failed with error:", error.message);
      console.log("Check the full logs for more details about the error.");
    }
  }
};
