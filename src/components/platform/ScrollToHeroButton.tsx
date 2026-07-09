'use client'

import { useEffect, useState } from 'react'
import { IconArrowUp } from '@tabler/icons-react'

export function ScrollToHeroButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver al inicio"
      className="lg:hidden fixed bottom-5 right-5 z-20 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
      style={{
        backgroundColor: '#6C2BD9',
        color: '#fff',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: visible ? 'auto' : 'none',
        boxShadow: '0 4px 16px rgba(108,43,217,0.35)',
      }}
    >
      <IconArrowUp size={20} />
    </button>
  )
}
