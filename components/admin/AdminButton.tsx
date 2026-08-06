import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { AdminIcon, type AdminIconName } from './AdminIcon'

interface AdminIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: AdminIconName
  title: string
  variant?: 'default' | 'primary' | 'danger'
  iconOnly?: boolean
  children?: ReactNode
}

export function AdminIconButton({
  icon,
  title,
  variant = 'default',
  iconOnly = true,
  children,
  className,
  ...props
}: AdminIconButtonProps) {
  const classes = [
    'btn',
    variant === 'primary' ? 'btn--primary' : '',
    variant === 'danger' ? 'btn--danger' : '',
    iconOnly ? 'btn--icon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={classes} title={title} aria-label={title} {...props}>
      <AdminIcon name={icon} />
      {!iconOnly && children ? <span>{children}</span> : null}
    </button>
  )
}

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: AdminIconName
  variant?: 'default' | 'primary' | 'danger'
  children: ReactNode
}

export function AdminButton({
  icon,
  variant = 'default',
  children,
  className,
  ...props
}: AdminButtonProps) {
  const classes = [
    'btn',
    variant === 'primary' ? 'btn--primary' : '',
    variant === 'danger' ? 'btn--danger' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={props.type ?? 'button'} className={classes} {...props}>
      {icon ? <AdminIcon name={icon} /> : null}
      <span>{children}</span>
    </button>
  )
}

interface AdminLinkButtonProps {
  href: string
  icon?: AdminIconName
  variant?: 'default' | 'primary' | 'danger'
  children: ReactNode
  className?: string
}

export function AdminLinkButton({
  href,
  icon,
  variant = 'default',
  children,
  className,
}: AdminLinkButtonProps) {
  const classes = [
    'btn',
    variant === 'primary' ? 'btn--primary' : '',
    variant === 'danger' ? 'btn--danger' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <a href={href} className={classes}>
      {icon ? <AdminIcon name={icon} /> : null}
      <span>{children}</span>
    </a>
  )
}
