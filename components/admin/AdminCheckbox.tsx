'use client'

interface AdminCheckboxProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
}

export function AdminCheckbox({ id, label, checked, onChange, hint }: AdminCheckboxProps) {
  return (
    <div className="admin-checkbox-field">
      <label htmlFor={id} className="admin-checkbox">
        <span className="admin-checkbox-label">{label}</span>
        <span className="admin-checkbox-control">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="admin-checkbox-box" aria-hidden />
        </span>
      </label>
      {hint && <p className="admin-checkbox-hint">{hint}</p>}
    </div>
  )
}
