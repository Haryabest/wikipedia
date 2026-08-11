#!/usr/bin/env bash
# Первичный деплой на Ubuntu/Debian (root или sudo).
# Пример:
#   export SITE_URL="http://95.163.86.120:3000"
#   export ADMIN_PASSWORD="ваш-сильный-пароль"
#   bash scripts/server-setup.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/wikipedia}"
REPO_URL="${REPO_URL:-https://github.com/Haryabest/wikipedia.git}"
BRANCH="${BRANCH:-main}"
SITE_URL="${SITE_URL:-http://127.0.0.1:3000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 48)}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)}"

if [[ -z "$ADMIN_PASSWORD" ]]; then
  echo "Задайте ADMIN_PASSWORD: export ADMIN_PASSWORD='...'"
  exit 1
fi

echo "==> Установка системных пакетов..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git curl ca-certificates openssl

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 20 ]]; then
  echo "==> Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Docker..."
  curl -fsSL https://get.docker.com | sh
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> PM2..."
  npm install -g pm2
fi

mkdir -p "$(dirname "$APP_DIR")"

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "==> Клонирование $REPO_URL ..."
  git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$APP_DIR"
else
  echo "==> Обновление репозитория..."
  cd "$APP_DIR"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
fi

cd "$APP_DIR"

echo "==> Запуск PostgreSQL и MinIO..."
export MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
export MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-$(openssl rand -base64 18 | tr -dc 'a-zA-Z0-9' | head -c 18)}"
export POSTGRES_PASSWORD
docker compose -f docker-compose.infra.yml up -d

echo "==> Ожидание PostgreSQL..."
for i in $(seq 1 30); do
  if docker compose -f docker-compose.infra.yml exec -T postgres pg_isready -U wiki -d wiki >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

cat > .env <<EOF
DATABASE_URL="postgresql://wiki:${POSTGRES_PASSWORD}@127.0.0.1:5433/wiki"
JWT_SECRET="${JWT_SECRET}"
ADMIN_EMAIL="${ADMIN_EMAIL}"
ADMIN_PASSWORD="${ADMIN_PASSWORD}"
NEXT_PUBLIC_SITE_URL="${SITE_URL}"
NEXT_PUBLIC_SITE_NAME="Эфитека"
MINIO_ENDPOINT="http://127.0.0.1:9000"
MINIO_PUBLIC_URL="${SITE_URL}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY}"
MINIO_BUCKET="wiki-images"
EOF

echo "==> npm install и build..."
npm ci --legacy-peer-deps
npm run db:setup
npm run build

export APP_DIR="$APP_DIR"
pm2 delete efiteka 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

if command -v pm2 >/dev/null 2>&1; then
  pm2 startup systemd -u root --hp /root 2>/dev/null || pm2 startup
fi

echo ""
echo "=============================================="
echo "  Сайт:     ${SITE_URL}"
echo "  Админка:  ${SITE_URL}/admin/login"
echo "  Email:    ${ADMIN_EMAIL}"
echo "  Пароль:   (из ADMIN_PASSWORD)"
echo "  JWT:      сохранён в ${APP_DIR}/.env"
echo "=============================================="
echo "  pm2 status | pm2 logs efiteka"
echo "  Обновление: bash scripts/server-update.sh"
echo "=============================================="
