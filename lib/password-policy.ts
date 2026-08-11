const WEAK_PASSWORDS = new Set([
  'change-me',
  'change-me-in-production',
  'change-this-to-a-long-random-secret-in-production',
  'admin123',
  'wiki_secret',
  'minioadmin',
])

export function validateAdminPassword(password: string): string | null {
  const value = password.trim()
  if (value.length < 8) {
    return 'Пароль должен быть не короче 8 символов'
  }
  if (WEAK_PASSWORDS.has(value)) {
    return 'Пароль слишком простой — выберите другой'
  }
  return null
}
