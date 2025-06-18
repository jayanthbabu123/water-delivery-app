#!/bin/bash

# Script to prepare google-services.json for EAS builds

# Create the directory if it doesn't exist
mkdir -p android/app

# Check if google-services.json already exists
if [ -f "android/app/google-services.json" ]; then
  echo "google-services.json already exists, nothing to do."
  exit 0
fi

# Check if we have the file in the root
if [ -f "google-services.json" ]; then
  echo "Found google-services.json in root directory, copying to android/app/"
  cp google-services.json android/app/
  echo "Done!"
  exit 0
fi

# If we get here, we need to create a minimal version
echo "Creating minimal google-services.json for build to proceed"

# Write a minimal valid google-services.json to allow build to continue
cat > "android/app/google-services.json" << 'EOF'
{
  "project_info": {
    "project_number": "976235379245",
    "project_id": "water-delivery-app-92ba4",
    "storage_bucket": "water-delivery-app-92ba4.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:976235379245:android:657a063cedfd32bda956a4",
        "android_client_info": {
          "package_name": "com.waterdelivery.app"
        }
      },
      "oauth_client": [],
      "api_key": [
        {
          "current_key": "AIzaSyALJC9NMzN8mOCmVIu7ygvvS_-aYlvR504"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": []
        }
      }
    }
  ],
  "configuration_version": "1"
}
EOF

echo "Created google-services.json in android/app/"
echo "Done!"
