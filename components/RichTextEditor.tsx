'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
} from 'lucide-react'
import { EditorColorPicker } from '@/components/admin/EditorColorPicker'
import { ResizableImage, IMAGE_WIDTH_PRESETS } from '@/lib/tiptap-resizable-image'
import styles from './RichTextEditor.module.css'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  onUploadImage?: (file: File) => Promise<string>
  placeholder?: string
}

export function RichTextEditor({
  content,
  onChange,
  onUploadImage,
  placeholder = 'Начните писать статью...',
}: RichTextEditorProps) {
  const [imageActive, setImageActive] = useState(false)
  const [textColor, setTextColor] = useState('#1a1a1a')
  const lastEmittedContent = useRef(content)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextStyle,
      Color,
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'wiki-link' } }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML()
      lastEmittedContent.current = html
      onChange(html)
    },
    onSelectionUpdate: ({ editor: e }) => {
      setImageActive(e.isActive('image'))
      const color = e.getAttributes('textStyle').color as string | undefined
      if (color) setTextColor(color)
    },
    editorProps: {
      attributes: { class: styles.editorContent },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (content !== lastEmittedContent.current && content !== editor.getHTML()) {
      lastEmittedContent.current = content
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  const addImage = useCallback(async () => {
    if (!onUploadImage || !editor) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const url = await onUploadImage(file)
        editor.chain().focus().setImage({ src: url }).updateAttributes('image', { width: '100%' }).run()
      } catch (err: unknown) {
        window.alert(err instanceof Error ? err.message : 'Не удалось загрузить изображение')
      }
    }
    input.click()
  }, [editor, onUploadImage])

  const setImageWidth = useCallback((width: string) => {
    if (!editor) return
    editor.chain().focus().updateAttributes('image', { width }).run()
  }, [editor])

  const addWikiLink = useCallback(() => {
    if (!editor) return
    const target = prompt('Название статьи для ссылки:')
    if (!target) return
    const label = prompt('Текст ссылки (оставьте пустым = название статьи):', target)
    const text = label?.trim() || target
    editor.chain().focus().insertContent(`[[${target}|${text}]]`).run()
  }, [editor])

  const applyTextColor = useCallback((color: string) => {
    if (!editor) return
    setTextColor(color)
    editor.chain().focus().setColor(color).run()
  }, [editor])

  const clearTextColor = useCallback(() => {
    if (!editor) return
    setTextColor('#1a1a1a')
    editor.chain().focus().unsetColor().run()
  }, [editor])

  if (!editor) return null

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.active : ''} title="Жирный">
          <Bold size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.active : ''} title="Курсив">
          <Italic size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? styles.active : ''} title="Подчёркнутый">
          <UnderlineIcon size={16} strokeWidth={2} />
        </button>
        <span className={styles.sep} />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? styles.active : ''} title="Заголовок H2">
          <Heading2 size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? styles.active : ''} title="Заголовок H3">
          <Heading3 size={16} strokeWidth={2} />
        </button>
        <span className={styles.sep} />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? styles.active : ''} title="Маркированный список">
          <List size={16} strokeWidth={2} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? styles.active : ''} title="Нумерованный список">
          <ListOrdered size={16} strokeWidth={2} />
        </button>
        <span className={styles.sep} />
        <EditorColorPicker value={textColor} onChange={applyTextColor} onClear={clearTextColor} />
        <button type="button" onClick={addWikiLink} title="Ссылка на статью в Эфирии">
          <Link2 size={16} strokeWidth={2} />
        </button>
        {onUploadImage && (
          <button type="button" onClick={addImage} title="Вставить изображение">
            <ImageIcon size={16} strokeWidth={2} aria-hidden />
          </button>
        )}
        {imageActive && (
          <>
            <span className={styles.sep} />
            <span className={styles.resizeLabel}>Размер:</span>
            {IMAGE_WIDTH_PRESETS.map((w) => (
              <button
                key={w}
                type="button"
                className={styles.resizeBtn}
                onClick={() => setImageWidth(w)}
                title={`Ширина ${w}`}
              >
                {w}
              </button>
            ))}
          </>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
