#!/bin/bash

# Manual Deployment Script for Hostinger
# Run this on the server if auto-deploy doesn't work

set -e

echo "=========================================="
echo "Manual Deployment for Hostinger"
echo "=========================================="

# Navigate to your site directory
cd /home/u122886170/domains/compressify.gujjugarba.com

echo "Current directory: $(pwd)"

# Pull latest changes from git
echo "Pulling latest code..."
git pull origin main || git pull origin master

# Get the latest build version
LATEST=$(ls -t hbuilds/versions/ 2>/dev/null | head -1)

if [ -n "$LATEST" ]; then
    BUILD_DIR="hbuilds/versions/$LATEST/nodejs/server"
    echo "Build directory: $BUILD_DIR"
    
    if [ -d "$BUILD_DIR" ]; then
        cd "$BUILD_DIR"
    fi
fi

echo "Installing dependencies..."
/opt/alt/alt-nodejs24/root/usr/bin/npm install --production --ignore-scripts

echo "Building application..."
/opt/alt/alt-nodejs24/root/usr/bin/npm run build

echo "=========================================="
echo "Manual Deployment Completed!"
echo "=========================================="
echo "Your site: http://compressify.gujjugarba.com"
echo "=========================================="
