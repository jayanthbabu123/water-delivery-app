# Patches

This directory contains patches for npm packages that need modifications to work correctly with our project setup.

## How Patches Work

We use the `patch-package` utility to apply patches to npm packages. When a package is installed, the patches are automatically applied.

## Creating New Patches

To create a new patch:

1. Modify a file in `node_modules/package-name`
2. Run `npx patch-package package-name`
3. Commit the generated patch file

## Existing Patches

- None yet - placeholder for future patches

## Common Issues Fixed by Patches

- Dependency conflicts with React Native and Expo
- Firebase compatibility issues
- Specific version compatibility problems

For more information, see [patch-package documentation](https://github.com/ds300/patch-package).