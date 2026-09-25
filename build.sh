#!/bin/bash

# Alternative Build Script (simpler version)
# Use this if deploy.sh has issues

set -e

echo "Installing pnpm..."
npm install -g pnpm@9.15.4 || corepack enable

echo "Installing dependencies..."
pnpm install

echo "Building..."
pnpm run build

echo "Build complete!"
