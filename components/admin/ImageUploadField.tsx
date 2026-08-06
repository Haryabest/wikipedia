'use client'

import { AdminIcon } from '@/components/admin/AdminIcon'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<string>
  placeholder?: string
  error?: string
}

export function ImageUploadField({
  label,
  value,
  onChange,
  onUpload,
  placeholder = 'URL изображения',
  error,
}: ImageUploadFieldProps) {
  return (
    <div className="admin-upload-field">
      <label className="admin-upload-label">{label}</label>
      <div className={`admin-upload ${error ? 'admin-upload--error' : ''}`}>
        <div className="admin-upload-preview">
          {value ? (
            <img src={value} alt="" />
          ) : (
            <span className="admin-upload-placeholder">Нет изображения</span>
          )}
        </div>
        <div className="admin-upload-controls">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={error ? 'input-error' : ''}
          />
          <label className="btn admin-upload-btn">
            <AdminIcon name="upload" />
            Загрузить
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                try {
                  onChange(await onUpload(file))
                } catch (err: unknown) {
                  window.alert(err instanceof Error ? err.message : 'Не удалось загрузить изображение')
                }
              }}
            />
          </label>
        </div>
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
