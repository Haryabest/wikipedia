export async function adminFetch<T = unknown>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)

  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/admin/login'
    throw new Error('Unauthorized')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(typeof data?.error === 'string' ? data.error : 'Запрос не выполнен') as Error & {
      status?: number
      data?: unknown
    }
    error.status = res.status
    error.data = data
    throw error
  }
  return data as T
}
