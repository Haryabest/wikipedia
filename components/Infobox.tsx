import styles from './Infobox.module.css'

interface InfoboxRow {
  label: string
  value: string
}

interface InfoboxProps {
  imageUrl?: string | null
  caption?: string | null
  rows: InfoboxRow[]
}

export function Infobox({ imageUrl, caption, rows }: InfoboxProps) {
  if (!imageUrl && rows.length === 0) return null

  return (
    <aside className={`card ${styles.infobox}`}>
      {imageUrl && (
        <figure className={styles.figure}>
          <img src={imageUrl} alt={caption ?? ''} className={styles.image} />
          {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
        </figure>
      )}
      {rows.length > 0 && (
        <table className={styles.table}>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <th>{row.label}</th>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </aside>
  )
}
