'use client'

import { useEffect } from 'react'

export function FontLoader({ url }: { url: string }) {
  useEffect(() => {
    // Async font loading — does not block rendering (no render-blocking stylesheet)
    const existing = document.querySelector(`link[href="${url}"]`)
    if (existing) return

    const preconnect1 = document.createElement('link')
    preconnect1.rel = 'preconnect'
    preconnect1.href = 'https://fonts.googleapis.com'
    document.head.appendChild(preconnect1)

    const preconnect2 = document.createElement('link')
    preconnect2.rel = 'preconnect'
    preconnect2.href = 'https://fonts.gstatic.com'
    preconnect2.crossOrigin = 'anonymous'
    document.head.appendChild(preconnect2)

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.appendChild(link)
  }, [url])

  return null
}
