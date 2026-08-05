import slugifyLib from 'slugify'

slugifyLib.extend({ '№': 'no' })

export function createSlug(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    locale: 'ru',
    trim: true,
  })
}

export async function ensureUniqueSlug(
  baseSlug: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug || 'article'
  let counter = 1

  while (await isTaken(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
