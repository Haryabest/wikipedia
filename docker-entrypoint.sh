#!/bin/sh
set -e
npx prisma db push --skip-generate
npx tsx prisma/seed.ts 2>/dev/null || true
exec node server.js
