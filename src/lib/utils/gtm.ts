export function pushEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...data })
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}
