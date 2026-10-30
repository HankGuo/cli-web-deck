#!/usr/bin/env bash
set -e

echo "=================================================="
echo "  🚀 Installing CLI Web Deck..."
echo "=================================================="

# 1. Detect Package Manager and Install Dependencies
if [ -x "$(command -v apt-get)" ]; then
    echo "[1/3] Installing dependencies with apt..."
    sudo apt-get update -qq
    sudo apt-get install -y -qq tmux ttyd curl
elif [ -x "$(command -v brew)" ]; then
    echo "[1/3] Installing dependencies with brew..."
    brew install tmux ttyd
elif [ -x "$(command -v dnf)" ]; then
    echo "[1/3] Installing dependencies with dnf..."
    sudo dnf install -y tmux ttyd
else
    echo "⚠️ Warning: Please ensure 'tmux' and 'ttyd' are installed manually."
fi

# 2. Check Node.js
if ! [ -x "$(command -v node)" ]; then
    echo "❌ Node.js is required (v18+). Please install Node.js first."
    exit 1
fi

# 3. Install CLI Web Deck
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "[2/3] Linking cli-web-deck to /usr/local/bin..."

sudo ln -sf "$SCRIPT_DIR/bin/cli-web-deck" /usr/local/bin/cli-web-deck
chmod +x "$SCRIPT_DIR/bin/cli-web-deck"

echo "[3/3] Installation completed successfully!"
echo ""
echo "Try running:"
echo "  cli-web-deck --cmd \"bash\" --port 8080"
echo "  cli-web-deck --cmd \"python3\" --port 8888 --workspace ~/my-project"
echo ""
echo "Open in browser: http://<YOUR_SERVER_IP>:8080"
echo "=================================================="
