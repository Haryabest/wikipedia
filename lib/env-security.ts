const WEAK_SECRETS = new Set([
  'change-me',
  'change-me-in-production',
  'change-this-to-a-long-random-secret-in-production',
  'admin123',
  'wiki_secret',
  'minioadmin',
])

export function assertProductionSecrets(): void {
  if (process.env.NODE_ENV !== 'production') return

  const jwt = process.env.JWT_SECRET?.trim()
  if (!jwt || jwt.length < 32 || WEAK_SECRETS.has(jwt)) {
    throw new Error(
      'JWT_SECRET must be set to a random string of at least 32 characters in production'
    )
  }

  const adminPassword = process.env.ADMIN_PASSWORD?.trim()
  if (adminPassword && WEAK_SECRETS.has(adminPassword)) {
    throw new Error('ADMIN_PASSWORD must not use default values in production')
  }
}
