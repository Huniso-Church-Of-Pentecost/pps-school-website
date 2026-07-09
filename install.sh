#!/bin/bash
# ============================================================
#  PPS School Website – Install & Run Script
#  Works on: Termux (Android), Ubuntu, Debian, macOS
# ============================================================

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Pentecost Preparatory School Website       ║"
echo "║   Installation Script v2.0                   ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found."
  echo ""
  echo "Install instructions:"
  echo "  Termux:  pkg install nodejs"
  echo "  Ubuntu:  sudo apt install nodejs npm"
  echo "  macOS:   brew install node"
  exit 1
fi

NODE_VER=$(node -v)
echo "✅ Node.js found: $NODE_VER"

# Check npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install npm."
  exit 1
fi
echo "✅ npm found: $(npm -v)"

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ npm install failed. Check your internet connection."
  exit 1
fi

echo ""
echo "✅ All dependencies installed!"
echo ""

# Create data directory
mkdir -p data
mkdir -p public/uploads

echo "🗂️  Created data/ and public/uploads/ directories"
echo ""
echo "════════════════════════════════════════════════"
echo "  🚀 Starting PPS School Website Server..."
echo "════════════════════════════════════════════════"
echo ""
echo "  📱 Open in browser: http://localhost:3000"
echo "  🔐 Admin panel:     http://localhost:3000/admin"
echo "  👤 Login: admin / pps2025"
echo ""
echo "  Press Ctrl+C to stop the server"
echo ""

node server.js
