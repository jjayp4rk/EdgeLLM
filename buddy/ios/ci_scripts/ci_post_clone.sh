#!/bin/sh

# Navigate to the root of the repository
cd $CI_WORKSPACE

# Install Node.js dependencies
npm install

# Navigate to iOS directory
cd ios

# Install CocoaPods dependencies
pod install

# Create necessary directories if they don't exist
mkdir -p "Pods/Target Support Files/Pods-Buddy"

# Create empty xcfilelist files if they don't exist
touch "Pods/Target Support Files/Pods-Buddy/Pods-Buddy-frameworks-Release-input-files.xcfilelist"
touch "Pods/Target Support Files/Pods-Buddy/Pods-Buddy-frameworks-Release-output-files.xcfilelist"
touch "Pods/Target Support Files/Pods-Buddy/Pods-Buddy-resources-Release-input-files.xcfilelist"
touch "Pods/Target Support Files/Pods-Buddy/Pods-Buddy-resources-Release-output-files.xcfilelist"

# Set proper permissions
chmod -R 755 Pods 