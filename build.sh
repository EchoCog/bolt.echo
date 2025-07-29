#!/bin/bash

# Remove any existing node_modules and package-lock files
rm -rf node_modules
rm -f package-lock.json
rm -f pnpm-lock.yaml

# Remove the .tool-versions file to prevent asdf from trying to use pnpm
rm -f .tool-versions

# Copy the build-specific package.json
cp package.build.json package.json

# Force npm installation and build
npm install --force
npm run build
