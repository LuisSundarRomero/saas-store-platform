'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconPackage, IconArrowRight } from '@tabler/icons-react'

export default function RastrearPage() {
  const router = useRouter()
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')

  function handleRastrear(e: React.FormEvent) {
    e.preventDefault()
    const limpio = codigo.trim().toUpperCase()
    if (!limpio) {
      setError('Ingresa tu código de pedido')
      return
    }
    if (!limpio.startsWith('ORD-')) {
      setError('El código debe tener el formato ORD-XXX')
      return
    }
    router.push(`/pedido/${limpio}`)
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 bg-[#0B0B0C]">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#3A1014' }}>
            <IconPackage size={30} style={{ color: '#E11D2E' }} />
          </div>
        </div>

        <div className="text-center mb-7">
          <h1 className="text-2xl font-display text-[#F5F5F2] mb-1">Rastrear mi pedido</h1>
          <p className="text-sm text-[#9A9A9E]">
            Ingresa el código que recibiste por WhatsApp
          </p>
        </div>

        <form onSubmit={handleRastrear} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#9A9A9E] uppercase tracking-wide">
              Código de pedido
            </label>
            <input
              type="text"
              placeholder="ORD-001"
              value={codigo}
              onChange={(e) => { setCodigo(e.target.value); setError('') }}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none font-mono uppercase transition-colors bg-[#161618] text-[#F5F5F2]"
              style={{ borderColor: error ? '#EF4444' : '#2C2C30' }}
              autoFocus
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <p className="text-xs text-[#6B6B70]">
              Ejemplo: ORD-007 · Lo encuentras en tu mensaje de WhatsApp
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full font-semibold text-white text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#E11D2E' }}
          >
            Ver mi pedido
            <IconArrowRight size={16} />
          </button>
        </form>
      </div>
    </main>
  )
}
