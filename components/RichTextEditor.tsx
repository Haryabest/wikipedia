'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useEffect, useRef, useState } from 'react'
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

  const setColor = useCallback(() => {
    if (!editor) return
    const color = prompt('Цвет (hex, напр. #dc2626):', '#2563eb')
    if (color) editor.chain().focus().setColor(color).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? styles.active : ''} title="Жирный"><b>B</b></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? styles.active : ''} title="Курсив"><i>I</i></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? styles.active : ''} title="Подчёркнутый"><u>U</u></button>
        <span className={styles.sep} />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? styles.active : ''}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? styles.active : ''}>H3</button>
        <span className={styles.sep} />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? styles.active : ''}>• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? styles.active : ''}>1. List</button>
        <span className={styles.sep} />
        <button type="button" onClick={setColor} title="Цвет текста">A</button>
        <button type="button" onClick={addWikiLink} title="Wiki-ссылка">[[ ]]</button>
        {onUploadImage && <button type="button" onClick={addImage} title="Вставить изображение">🖼</button>}
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
