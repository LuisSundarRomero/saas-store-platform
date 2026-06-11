'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { IconLock, IconBrandWhatsapp, IconArrowLeft, IconPackage } from '@tabler/icons-react'
import { PedidoConItems } from '@/types'
import { verificarPedido } from '@/lib/actions/pedidos'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { pushEvent } from '@/lib/utils/gtm'
import { OrderTimeline } from './OrderTimeline'

const ESTADO_LABEL: Record<string, string> = {
  pendiente:        'Pendiente',
  pago_confirmado:  'Pago confirmado',
  empaquetado:      'Empaquetado',
  en_camino:        'En camino',
  entregado:        'Entregado ✓',
}

const ESTADO_COLOR: Record<string, { bg: string; color: string }> = {
  pendiente:        { bg: '#3A2A0A', color: '#F59E0B' },
  pago_confirmado:  { bg: '#3A1014', color: '#FF6B7A' },
  empaquetado:      { bg: '#11203A', color: '#60A5FA' },
  en_camino:        { bg: '#2A1F3A', color: '#C4B5FD' },
  entregado:        { bg: '#0F2A18', color: '#22C55E' },
}

interface Props {
  orderId: string
  whatsappNumero: string
}

export function TrackingClient({ orderId, whatsappNumero }: Props) {
  const [telefono, setTelefono] = useState('')
  const [pedido, setPedido] = useState<PedidoConItems | null>(null)
  const [error, setError] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleVerificar() {
    if (!telefono.trim()) return
    startTransition(async () => {
      const data = await verificarPedido(orderId, telefono.trim())
      if (data) {
        setPedido(data as PedidoConItems)
        setError(false)
        pushEvent('order_tracking_view', {
          order_id: orderId,
          estado: (data as PedidoConItems).estado,
        })
      } else {
        setError(true)
      }
    })
  }

  // Auto-refresco cada 60s
  useEffect(() => {
    if (!pedido) return
    const interval = setInterval(async () => {
      const updated = await verificarPedido(orderId, telefono.trim())
      if (updated && (updated as PedidoConItems).estado !== pedido.estado) {
        setPedido(updated as PedidoConItems)
      }
    }, 60_000)
    return () => clearInterval(interval)
  }, [pedido, orderId, telefono])

  if (!pedido) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 bg-[#0B0B0C]"
      >
        <div className="bg-[#161618] border border-[#2C2C30] rounded-3xl p-8 max-w-sm w-full text-center">

          {/* Icono */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#3A1014' }}>
              <IconLock size={26} style={{ color: '#E11D2E' }} />
            </div>
          </div>

          <h1 className="text-xl font-display text-[#F5F5F2] mb-1">Rastrea tu pedido</h1>
          <p className="text-sm text-[#9A9A9E] mb-1">
            Código:{' '}
            <span className="font-bold" style={{ color: '#E11D2E' }}>#{orderId}</span>
          </p>
          <p className="text-sm text-[#6B6B70] mb-7">
            Ingresa el número con el que hiciste tu pedido
          </p>

          <div className="flex flex-col gap-3">
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Ej: 987 654 321"
              value={telefono}
              onChange={(e) => { setTelefono(e.target.value); setError(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerificar()}
              className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none text-center font-mono text-[#F5F5F2] bg-[#0B0B0C] transition-colors"
              style={{
                borderColor: error ? '#EF4444' : telefono.length >= 9 ? '#E11D2E' : '#2C2C30',
              }}
            />
            {error && (
              <p className="text-xs font-medium -mt-1" style={{ color: '#EF4444' }}>
                Número incorrecto, intenta de nuevo
              </p>
            )}

            <button
              onClick={handleVerificar}
              disabled={isPending || !telefono.trim()}
              className="w-full text-white font-semibold py-3.5 rounded-full transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#E11D2E' }}
            >
              {isPending ? 'Verificando...' : 'Ver mi pedido →'}
            </button>
          </div>

          <p className="text-xs text-[#6B6B70] mt-6">
            ¿Problemas?{' '}
            <a
              href={`https://wa.me/${whatsappNumero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold"
              style={{ color: '#E11D2E' }}
            >
              Escríbenos por WhatsApp
            </a>
          </p>
        </div>
      </main>
    )
  }

  const estadoColor = ESTADO_COLOR[pedido.estado] ?? ESTADO_COLOR.pendiente

  return (
    <main className="min-h-screen bg-[#0B0B0C]">

      {/* Header */}
      <div className="bg-[#0B0B0C]/95 backdrop-blur border-b border-[#2C2C30] px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/"
          className="p-1.5 rounded-full hover:bg-[#1F1F22] transition-colors text-[#9A9A9E]">
          <IconArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#6B6B70]">Seguimiento de pedido</p>
          <p className="font-bold text-[#F5F5F2] text-sm">#{orderId}</p>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: estadoColor.bg, color: estadoColor.color }}
        >
          {ESTADO_LABEL[pedido.estado]}
        </span>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 flex flex-col gap-4">

        {/* Fecha */}
        <p className="text-xs text-[#6B6B70] text-center">{formatDate(pedido.created_at)}</p>

        {/* Timeline card */}
        <div className="bg-[#161618] border border-[#2C2C30] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <IconPackage size={16} className="text-[#9A9A9E]" />
            <h2 className="text-sm font-semibold text-[#F5F5F2]">Estado del pedido</h2>
          </div>
          <OrderTimeline estadoActual={pedido.estado} historial={pedido.estado_historial} />
        </div>

        {/* Productos card */}
        <div className="bg-[#161618] border border-[#2C2C30] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-[#F5F5F2] mb-4">Detalle del pedido</h2>
          <div className="flex flex-col gap-3">
            {pedido.pedido_items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F5F5F2] leading-snug">{item.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {item.talla && (
                      <span className="text-[11px] bg-[#1F1F22] text-[#9A9A9E] px-2 py-0.5 rounded-full font-medium">
                        Talla {item.talla}
                      </span>
                    )}
                    {item.color && (
                      <span className="text-[11px] bg-[#1F1F22] text-[#9A9A9E] px-2 py-0.5 rounded-full font-medium capitalize">
                        {item.color}
                      </span>
                    )}
                    <span className="text-[11px] text-[#6B6B70]">× {item.cantidad}</span>
                  </div>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: '#E11D2E' }}>
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 mt-3 border-t border-[#2C2C30]">
            <span className="text-sm font-semibold text-[#9A9A9E]">Total</span>
            <span className="text-lg font-bold" style={{ color: '#E11D2E' }}>{formatPrice(pedido.total)}</span>
          </div>
        </div>

        {/* CTA WhatsApp */}
        <a
          href={`https://wa.me/${whatsappNumero}?text=${encodeURIComponent(`Hola! Tengo una consulta sobre mi pedido #${orderId}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-white font-semibold py-4 rounded-2xl transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#25D366' }}
        >
          <IconBrandWhatsapp size={20} />
          Preguntar por mi pedido
        </a>

        <p className="text-center text-xs text-[#6B6B70] pb-4">
          Se actualiza automáticamente
        </p>
      </div>
    </main>
  )
}
