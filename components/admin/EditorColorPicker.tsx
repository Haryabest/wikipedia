'use client'

import { useEffect, useRef, useState } from 'react'
import { Palette } from 'lucide-react'
import styles from './EditorColorPicker.module.css'

const PRESET_COLORS = [
  '#1a1a1a',
  '#2563eb',
  '#dc2626',
  '#7c3aed',
  '#16a34a',
  '#9333ea',
  '#ca8a04',
  '#0891b2',
]

interface EditorColorPickerProps {
  value: string
  onChange: (color: string) => void
  onClear: () => void
}

function normalizeHex(value: string): string | null {
  const trimmed = value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`
  return null
}

export function EditorColorPicker({ value, onChange, onClear }: EditorColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [hexInput, setHexInput] = useState(value)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHexInput(value)
  }, [value])

  useEffect(() => {
    if (!open) return

    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function applyColor(color: string) {
    const normalized = normalizeHex(color)
    if (!normalized) return
    setHexInput(normalized)
    onChange(normalized)
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        title="Цвет текста"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <Palette size={16} strokeWidth={2} />
        <span className={styles.swatch} style={{ backgroundColor: value }} aria-hidden />
      </button>

      {open && (
        <div className={styles.popover}>
          <label className={styles.colorField}>
            <span>Выберите цвет</span>
            <input
              type="color"
              value={value}
              onChange={(e) => applyColor(e.target.value)}
            />
          </label>

          <label className={styles.hexField}>
            <span>HEX</span>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={() => {
                const normalized = normalizeHex(hexInput)
                if (normalized) applyColor(normalized)
                else setHexInput(value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const normalized = normalizeHex(hexInput)
                  if (normalized) applyColor(normalized)
                }
              }}
              placeholder="#2563eb"
            />
          </label>

          <div className={styles.presets}>
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={value === color ? styles.presetActive : styles.preset}
                style={{ backgroundColor: color }}
                title={color}
                onClick={() => applyColor(color)}
              />
            ))}
          </div>

          <button type="button" className={styles.clearBtn} onClick={onClear}>
            Сбросить цвет
          </button>
        </div>
      )}
    </div>
  )
}
