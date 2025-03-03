#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting build process..."

# Build Rust WASM module
echo "📦 Building Rust WASM module..."
cd rust-wasm
wasm-pack build --target web
cd ..

# Copy WASM files to Angular assets
echo "📋 Copying WASM files to Angular assets..."
mkdir -p angular-app/src/assets/wasm
cp rust-wasm/pkg/rust_wasm.js angular-app/src/assets/wasm/
cp rust-wasm/pkg/rust_wasm_bg.wasm angular-app/src/assets/wasm/
cp rust-wasm/pkg/rust_wasm.d.ts angular-app/src/assets/wasm/

# Install Angular dependencies
echo "📥 Installing Angular dependencies..."
cd angular-app
npm install --legacy-peer-deps

# Build Angular app
echo "🏗️ Building Angular app..."
npm run build

# Start the server
echo "🚀 Starting server..."
npm run serve:wasm 