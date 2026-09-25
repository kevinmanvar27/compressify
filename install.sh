#!/bin/bash

# Pre-deployment script to install dependencies with npm
set -e

echo "=========================================="
echo "Pre-deployment: Installing dependencies with npm..."
echo "=========================================="

# Use npm instead of pnpm
npm install --legacy-peer-deps

echo "=========================================="
echo "npm dependencies installed successfully!"
echo "=========================================="
npm --version
