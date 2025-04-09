#!/bin/bash

# Create the plugin directory structure
PLUGIN_NAME="PgVisualExplain.tableplusplugin"
PLUGIN_BUILD_DIR="$PLUGIN_NAME"

# Remove existing build directory if it exists
if [ -d "$PLUGIN_BUILD_DIR" ]; then
  rm -rf "$PLUGIN_BUILD_DIR"
fi

# Create the plugin directory
mkdir -p "$PLUGIN_BUILD_DIR"

# Copy the necessary files
cp manifest.json "$PLUGIN_BUILD_DIR/"
cp -r dist "$PLUGIN_BUILD_DIR/"

# Create a zip file for distribution
if [ -f "$PLUGIN_NAME.zip" ]; then
  rm "$PLUGIN_NAME.zip"
fi

zip -r "$PLUGIN_NAME.zip" "$PLUGIN_BUILD_DIR"

echo "Plugin packaged successfully: $PLUGIN_NAME.zip"
