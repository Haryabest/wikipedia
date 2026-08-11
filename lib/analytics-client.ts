'use client'

const SESSION_KEY = 'efiteka_sid'

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return 'unknown'
  }
}

export async function trackAnalytics(
  type: 'pageview' | 'click' | 'outbound',
  path: string,
  target?: string
) {
  try {
    await fetch('/api/analytics/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        path,
        target,
        sessionId: getSessionId(),
        referrer: document.referrer || null,
      }),
      keepalive: true,
    })
  } catch {
    // ignore analytics errors
  }
}
