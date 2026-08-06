'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AdminButton } from '@/components/admin/AdminButton'

interface ModalState {
  type: 'alert' | 'confirm'
  title: string
  message: string
}

interface AdminModalContextValue {
  alert: (message: string, title?: string) => Promise<void>
  confirm: (message: string, title?: string) => Promise<boolean>
}

const AdminModalContext = createContext<AdminModalContextValue | null>(null)

export function useAdminModal() {
  const ctx = useContext(AdminModalContext)
  if (!ctx) {
    throw new Error('useAdminModal must be used within AdminModalProvider')
  }
  return ctx
}

export function AdminModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const close = useCallback((result: boolean) => {
    resolverRef.current?.(result)
    resolverRef.current = null
    setModal(null)
  }, [])

  const alert = useCallback((message: string, title = 'Готово') => {
    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve()
      setModal({ type: 'alert', title, message })
    })
  }, [])

  const confirm = useCallback((message: string, title = 'Подтверждение') => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
      setModal({ type: 'confirm', title, message })
    })
  }, [])

  useEffect(() => {
    const current = modal
    if (!current) return
    const modalType = current.type

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close(modalType === 'confirm' ? false : true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modal, close])

  const value = useMemo(() => ({ alert, confirm }), [alert, confirm])

  return (
    <AdminModalContext.Provider value={value}>
      {children}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => close(modal.type === 'confirm' ? false : true)}>
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-modal-title" className="admin-modal-title">{modal.title}</h2>
            <p className="admin-modal-message">{modal.message}</p>
            <div className="admin-modal-actions">
              {modal.type === 'confirm' ? (
                <>
                  <AdminButton type="button" icon="x" onClick={() => close(false)}>
                    Отмена
                  </AdminButton>
                  <AdminButton type="button" icon="trash" variant="danger" onClick={() => close(true)}>
                    Удалить
                  </AdminButton>
                </>
              ) : (
                <AdminButton type="button" icon="check" variant="primary" onClick={() => close(true)}>
                  OK
                </AdminButton>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminModalContext.Provider>
  )
}
