#!/bin/bash

# Pre-deployment script to install pnpm
# Run this before the main build process

set -e

echo "Pre-deployment: Installing pnpm..."

# Try multiple methods to install pnpm
if command -v corepack &> /dev/null; then
    echo "Using corepack..."
    corepack enable
    corepack prepare pnpm@9.15.4 --activate
else
    echo "Using npm to install pnpm..."
    npm install -g pnpm@9.15.4
fi

echo "pnpm installed successfully!"
pnpm --version
