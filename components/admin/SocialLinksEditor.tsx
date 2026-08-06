'use client'

import { useMemo, useState } from 'react'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminIconButton } from '@/components/admin/AdminButton'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { SocialNetworkPicker } from '@/components/admin/SocialNetworkPicker'
import { SocialBrandIcon } from '@/components/SocialBrandIcon'
import {
  CUSTOM_SOCIAL_LABEL,
  createSocialLinkFromOption,
  MAX_SOCIAL_LINKS,
  SOCIAL_NETWORK_OPTIONS,
  type SocialLinkItem,
  type SocialNetworkOption,
} from '@/lib/social-links'
import styles from './SocialLinksEditor.module.css'

interface SocialLinksEditorProps {
  links: SocialLinkItem[]
  onChange: (links: SocialLinkItem[]) => void
  onUpload: (file: File) => Promise<string>
}

function SocialLinkRow({
  link,
  onSave,
  onRemove,
}: {
  link: SocialLinkItem
  onSave: (url: string) => void
  onRemove: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftUrl, setDraftUrl] = useState(link.url)

  function startEdit() {
    setDraftUrl(link.url)
    setEditing(true)
  }

  function saveEdit() {
    const url = draftUrl.trim()
    if (!url) return
    onSave(url)
    setEditing(false)
  }

  function cancelEdit() {
    setDraftUrl(link.url)
    setEditing(false)
  }

  return (
    <li className={styles.item}>
      <SocialBrandIcon
        iconFile={link.iconFile}
        imageUrl={link.imageUrl}
        label={link.label}
        size="lg"
      />
      <div className={styles.itemBody}>
        <div className={styles.itemTitle}>{link.label || 'Соцсеть'}</div>
        {editing ? (
          <input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="https://..."
            className={styles.urlInput}
            autoFocus
          />
        ) : (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.urlLink}
            title={link.url}
          >
            {link.url}
          </a>
        )}
      </div>
      <div className={styles.actions}>
        {editing ? (
          <>
            <AdminIconButton icon="check" title="Сохранить ссылку" variant="primary" onClick={saveEdit} />
            <AdminIconButton icon="x" title="Отменить редактирование" onClick={cancelEdit} />
          </>
        ) : (
          <>
            <AdminIconButton icon="edit" title="Редактировать ссылку" onClick={startEdit} />
            <AdminIconButton icon="trash" title="Удалить" variant="danger" onClick={onRemove} />
          </>
        )}
      </div>
    </li>
  )
}

export function SocialLinksEditor({ links, onChange, onUpload }: SocialLinksEditorProps) {
  const [selected, setSelected] = useState<SocialNetworkOption | null>(null)
  const [customLabel, setCustomLabel] = useState('')
  const [customImageUrl, setCustomImageUrl] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const usedLabels = useMemo(() => new Set(links.map((link) => link.label).filter(Boolean)), [links])
  const availableOptions = useMemo(
    () => SOCIAL_NETWORK_OPTIONS.filter((option) => !usedLabels.has(option.label)),
    [usedLabels]
  )

  const isCustom = selected?.label === CUSTOM_SOCIAL_LABEL

  function removeLink(index: number) {
    onChange(links.filter((_, i) => i !== index))
  }

  function updateLink(index: number, url: string) {
    onChange(links.map((link, i) => (i === index ? { ...link, url } : link)))
  }

  function addLink() {
    const url = newUrl.trim()
    if (!url) return

    if (links.length >= MAX_SOCIAL_LINKS) return

    if (isCustom) {
      const label = customLabel.trim() || CUSTOM_SOCIAL_LABEL
      if (!customImageUrl.trim()) return
      if (usedLabels.has(label)) return
      onChange([
        ...links,
        { label, url, imageUrl: customImageUrl, iconFile: null },
      ])
      setCustomLabel('')
      setCustomImageUrl('')
    } else if (selected) {
      if (usedLabels.has(selected.label)) return
      onChange([...links, createSocialLinkFromOption(selected, url)])
    } else {
      return
    }

    setSelected(null)
    setNewUrl('')
  }

  const canAdd =
    newUrl.trim() &&
    links.length < MAX_SOCIAL_LINKS &&
    (isCustom ? customImageUrl.trim() : selected && !usedLabels.has(selected.label))

  return (
    <div className={styles.root}>
      {links.length > 0 && (
        <ul className={styles.list}>
          {links.map((link, index) => (
            <SocialLinkRow
              key={`${link.label}-${index}`}
              link={link}
              onSave={(url) => updateLink(index, url)}
              onRemove={() => removeLink(index)}
            />
          ))}
        </ul>
      )}

      {links.length === 0 && (
        <p className={styles.empty}>Пока нет добавленных соцсетей.</p>
      )}

      {links.length < MAX_SOCIAL_LINKS ? (
        <div className={styles.addForm}>
          <div className={styles.addRow}>
            <SocialNetworkPicker
              options={[
                ...availableOptions,
                { label: CUSTOM_SOCIAL_LABEL, iconFile: '__custom__' },
              ]}
              value={selected}
              onChange={setSelected}
            />
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Ссылка на профиль"
              className={styles.urlInput}
            />
            <AdminButton icon="plus" variant="primary" onClick={addLink} disabled={!canAdd}>
              Добавить
            </AdminButton>
          </div>

          {isCustom && (
            <div className={styles.customFields}>
              <label>
                Название
                <input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Например: Rutube"
                />
              </label>
              <ImageUploadField
                label="Своя иконка"
                value={customImageUrl}
                onChange={setCustomImageUrl}
                onUpload={onUpload}
              />
            </div>
          )}
        </div>
      ) : (
        <p className={styles.limit}>Достигнут лимит: {MAX_SOCIAL_LINKS} соцсетей.</p>
      )}
    </div>
  )
}
