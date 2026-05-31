#!/bin/bash
set -e

APP_DIR=/opt/vibcheck

echo "==> Pulling latest code..."
cd "$APP_DIR"
git pull

echo "==> Installing backend dependencies..."
cd "$APP_DIR/backend"
"$APP_DIR/venv/bin/pip" install -r requirements.txt -q

echo "==> Building frontend..."
cd "$APP_DIR/frontend"
npm install --silent
npm run build

echo "==> Restarting backend service..."
systemctl restart vibcheck

echo "==> Done. Check: systemctl status vibcheck"
