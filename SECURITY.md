# Безопасность

## Перед продакшеном

1. Задайте **JWT_SECRET** — случайная строка **≥ 32 символов** (`openssl rand -base64 48`).
2. Смените **ADMIN_PASSWORD** и не используйте `admin123`.
3. Укажите **NEXT_PUBLIC_SITE_URL** с реальным доменом (https).
4. MinIO/PostgreSQL — не открывайте порты наружу; используйте сильные пароли.
5. Запуск: `NODE_ENV=production` — приложение проверит слабые секреты при старте.

## Что уже защищено

- JWT в httpOnly cookie (sameSite=lax, secure в production)
- Проверка JWT в middleware и на всех admin API
- Rate limit на логин и загрузки
- Санитизация HTML (DOMPurify) при сохранении и отображении статей
- Проверка загрузок по magic bytes (не только Content-Type)
- Валидация внешних URL в настройках и карусели
- Security headers (CSP, X-Frame-Options, nosniff, HSTS в production)
- Прокси медиа без публичного MinIO bucket

## После обновления безопасности

Старые сессии админки могут сброситься — войдите в `/admin/login` снова.
