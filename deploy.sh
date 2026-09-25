#!/bin/bash

# Deployment Script for Hostinger Node.js
# This script ensures pnpm is installed and dependencies are properly set up

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

# Install pnpm globally if not present or use npx
echo "=========================================="
echo "Setting up pnpm..."
echo "=========================================="

# Method 1: Try to enable corepack (preferred method)
if command -v corepack &> /dev/null; then
    echo "Enabling corepack..."
    corepack enable || true
    corepack prepare pnpm@9.15.4 --activate || true
fi

# Method 2: Install pnpm via npm if corepack fails
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm via npm..."
    npm install -g pnpm@9.15.4
fi

# Verify pnpm installation
echo "pnpm version:"
pnpm --version

# Clean cache if needed (optional, uncomment if you face issues)
# echo "Cleaning pnpm cache..."
# pnpm store prune || true

# Install dependencies
echo "=========================================="
echo "Installing dependencies..."
echo "=========================================="
pnpm install --frozen-lockfile

# Build the application
echo "=========================================="
echo "Building application..."
echo "=========================================="
pnpm run build

echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
