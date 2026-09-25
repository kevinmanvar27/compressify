#!/bin/bash

# Deployment Script for Hostinger Node.js
# This script uses npm instead of pnpm

set -e  # Exit on any error

echo "=========================================="
echo "Starting Deployment Process"
echo "=========================================="

# Check Node.js version
echo "Node.js version:"
node --version

# Check npm version
echo "npm version:"
npm --version

# Install dependencies
echo "=========================================="
echo "Installing dependencies with npm..."
echo "=========================================="
npm install --legacy-peer-deps

# Build the application
echo "=========================================="
echo "Building application..."
echo "=========================================="
npm run build

echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
