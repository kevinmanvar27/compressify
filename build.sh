#!/bin/bash

# Build Script - Use npm instead of pnpm
set -e

echo "=========================================="
echo "Building Next.js Application with npm"
echo "=========================================="

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Building application..."
npm run build

echo "=========================================="
echo "Build complete!"
echo "=========================================="
