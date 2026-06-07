'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IconX } from '@tabler/icons-react'

interface Props {
  texto: string
  link?: string | null
  expira?: string | null
}

function useCountdown(expira?: string | null) {
  const [remaining, setRemaining] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    if (!expira) return

    function calcular() {
      const diff = new Date(expira!).getTime() - Date.now()
      if (diff <= 0) { setExpired(true); setRemaining(null); return }

      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)

      if (h >= 24) {
        const d = Math.floor(h / 24)
        setRemaining(`${d}d ${h % 24}h`)
      } else if (h > 0) {
        setRemaining(`${h}h ${String(m).padStart(2, '0')}m`)
      } else {
        setRemaining(`${m}m ${String(s).padStart(2, '0')}s`)
      }
    }

    calcular()
    const id = setInterval(calcular, 1000)
    return () => clearInterval(id)
  }, [expira])

  return { remaining, expired }
}

export function AnnouncementBar({ texto, link, expira }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const { remaining, expired } = useCountdown(expira)

  if (dismissed || expired) return null

  const contenido = (
    <span className="text-center leading-snug">
      {texto}
      {remaining && (
        <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold tabular-nums">
          ⏱ {remaining}
        </span>
      )}
    </span>
  )

  return (
    <div className="relative flex items-center justify-center gap-3 px-10 py-2.5 text-white text-sm font-medium"
      style={{ backgroundColor: '#EC4899' }}>

      {link
        ? <Link href={link} className="hover:underline underline-offset-2">{contenido}</Link>
        : contenido
      }

      {/* Cerrar */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Cerrar anuncio"
      >
        <IconX size={14} />
      </button>
    </div>
  )
}
