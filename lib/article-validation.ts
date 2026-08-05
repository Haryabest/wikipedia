export type PublishField =
  | 'title'
  | 'summary'
  | 'content'
  | 'mainCategoryId'
  | 'subcategoryId'
  | 'infoboxImageUrl'

export type FieldErrors = Partial<Record<PublishField, string>>

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

export function validateForPublish(data: {
  title: string
  summary: string
  content: string
  mainCategoryId: string
  subcategoryId: string
  infoboxImageUrl: string
  hasSubcategories: boolean
}): FieldErrors {
  const errors: FieldErrors = {}

  if (!data.title.trim()) {
    errors.title = 'Укажите заголовок статьи'
  }
  if (!data.summary.trim()) {
    errors.summary = 'Добавьте краткое описание — оно отображается в карточках'
  }
  if (!stripHtml(data.content)) {
    errors.content = 'Добавьте текст статьи'
  }
  if (!data.mainCategoryId) {
    errors.mainCategoryId = 'Выберите категорию'
  }
  if (data.hasSubcategories && !data.subcategoryId) {
    errors.subcategoryId = 'Выберите подкатегорию'
  }
  if (!data.infoboxImageUrl.trim()) {
    errors.infoboxImageUrl = 'Загрузите основное фото (инфобокс)'
  }

  return errors
}

export function publishErrorsList(errors: FieldErrors): string[] {
  return Object.values(errors)
}
