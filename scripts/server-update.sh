#!/usr/bin/env bash
# Обновление после git push: bash scripts/server-update.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/wikipedia}"
cd "$APP_DIR"

git pull origin "${BRANCH:-main}"

npm ci --legacy-peer-deps
npm run db:setup
npm run build

export APP_DIR="$APP_DIR"
pm2 restart efiteka
pm2 save

echo "Обновление завершено. pm2 logs efiteka"
