#!/bin/bash

# Hostinger Auto-Deploy Script
# This script runs automatically after git push

set -e

echo "=========================================="
echo "Hostinger Deployment Started"
echo "=========================================="

# Get the latest build version
LATEST=$(ls -t /home/u122886170/domains/compressify.gujjugarba.com/hbuilds/versions/ 2>/dev/null | head -1)

if [ -z "$LATEST" ]; then
    echo "No build version found. Using current directory."
    BUILD_DIR="/home/u122886170/domains/compressify.gujjugarba.com"
else
    BUILD_DIR="/home/u122886170/domains/compressify.gujjugarba.com/hbuilds/versions/$LATEST/nodejs/server"
    echo "Using build directory: $BUILD_DIR"
fi

# Navigate to build directory
cd "$BUILD_DIR" || exit 1

echo "Current directory: $(pwd)"

# Install dependencies using Hostinger's Node.js
echo "=========================================="
echo "Installing dependencies..."
echo "=========================================="

# Use Hostinger's npm path
NPM_PATH="/opt/alt/alt-nodejs24/root/usr/bin/npm"

if [ -f "$NPM_PATH" ]; then
    echo "Using Hostinger npm: $NPM_PATH"
    $NPM_PATH install --production --ignore-scripts
else
    echo "Using system npm"
    npm install --production --ignore-scripts
fi

# Build the application
echo "=========================================="
echo "Building application..."
echo "=========================================="

if [ -f "$NPM_PATH" ]; then
    $NPM_PATH run build
else
    npm run build
fi

echo "=========================================="
echo "Deployment Completed Successfully!"
echo "=========================================="
echo "Your site is live at: http://compressify.gujjugarba.com"
echo "=========================================="
