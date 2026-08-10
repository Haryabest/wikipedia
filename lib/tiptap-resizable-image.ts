import Image from '@tiptap/extension-image'
import { normalizeMediaUrl } from '@/lib/media-url'

export const ResizableImage = Image.extend({
  addAttributes() {
    const parent = this.parent?.() ?? {}
    return {
      ...parent,
      src: {
        ...(parent as { src?: Record<string, unknown> }).src,
        renderHTML: (attributes: { src?: string | null }) => {
          if (!attributes.src) return {}
          return { src: normalizeMediaUrl(attributes.src) ?? attributes.src }
        },
      },
      width: {
        default: '100%',
        parseHTML: (element) => element.getAttribute('data-width') || element.style.width || '100%',
        renderHTML: (attributes) => {
          const width = attributes.width || '100%'
          return {
            'data-width': width,
            style: `width: ${width}; height: auto; max-width: 100%;`,
          }
        },
      },
    }
  },
})

export const IMAGE_WIDTH_PRESETS = ['25%', '50%', '75%', '100%'] as const
