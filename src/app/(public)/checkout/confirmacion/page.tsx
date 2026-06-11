'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { IconBrandWhatsapp, IconPackage, IconArrowRight } from '@tabler/icons-react'

export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const order = searchParams.get('order')
  const [waUrl, setWaUrl] = useState<string | null>(null)
  const [waAbierto, setWaAbierto] = useState(false)

  useEffect(() => {
    const url = sessionStorage.getItem('wa_pending')
    if (url) {
      sessionStorage.removeItem('wa_pending')
      setWaUrl(url)
    }
  }, [])

  function handleAbrirWhatsApp() {
    if (!waUrl) return
    window.open(waUrl, '_blank')
    setWaAbierto(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0B0B0C]">
      <div className="w-full max-w-sm">

        {/* Icono */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: '#3A1014' }}>
            🦇
          </div>
        </div>

        {/* Mensaje */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display text-[#F5F5F2] mb-2">
            ¡Pedido listo!
          </h1>
          <p className="text-[#9A9A9E] text-sm leading-relaxed">
            Tu pedido fue creado. Ahora envíalo por WhatsApp para confirmarlo.
          </p>
        </div>

        {/* Order ID */}
        {order && (
          <div className="rounded-2xl p-5 mb-5 text-center border border-[#2C2C30]"
            style={{ backgroundColor: '#161618' }}>
            <p className="text-xs font-semibold text-[#FF6B7A] uppercase tracking-widest mb-1">
              Tu código de pedido
            </p>
            <p className="text-3xl font-bold" style={{ color: '#E11D2E' }}>
              #{order}
            </p>
            <p className="text-xs text-[#FF6B7A] mt-1">Guárdalo para rastrear tu pedido</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          {waUrl && (
            <button
              type="button"
              onClick={handleAbrirWhatsApp}
              className="w-full py-3.5 rounded-full font-semibold text-white text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}>
              <IconBrandWhatsapp size={18} />
              {waAbierto ? 'Abrir WhatsApp de nuevo' : 'Enviar pedido por WhatsApp'}
            </button>
          )}

          {order && (
            <Link href={`/pedido/${order}`}
              className="w-full py-3.5 rounded-full font-semibold text-white text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#E11D2E' }}>
              <IconPackage size={18} />
              Rastrear mi pedido
            </Link>
          )}

          <Link href="/catalogo"
            className="w-full py-3 rounded-full font-medium text-sm flex items-center justify-center gap-1.5 border border-[#2C2C30] text-[#9A9A9E] hover:bg-[#161618] hover:text-[#F5F5F2] transition-colors">
            Seguir viendo productos
            <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  )
}
