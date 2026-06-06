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
  pendiente:        { bg: '#FEF3C7', color: '#92400E' },
  pago_confirmado:  { bg: '#FCE7F3', color: '#BE185D' },
  empaquetado:      { bg: '#DBEAFE', color: '#1D4ED8' },
  en_camino:        { bg: '#EDE9FE', color: '#5B21B6' },
  entregado:        { bg: '#DCFCE7', color: '#15803D' },
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
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(160deg, #fff5f9 0%, #fce7f3 40%, #ffffff 100%)' }}
      >
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
          style={{ boxShadow: '0 8px 40px rgba(236,72,153,0.10)' }}>

          {/* Icono */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#FCE7F3' }}>
              <IconLock size={26} style={{ color: '#EC4899' }} />
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">Rastrea tu pedido</h1>
          <p className="text-sm text-gray-500 mb-1">
            Código:{' '}
            <span className="font-bold" style={{ color: '#EC4899' }}>#{orderId}</span>
          </p>
          <p className="text-sm text-gray-400 mb-7">
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
              className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none text-center font-mono text-gray-800 transition-colors"
              style={{
                borderColor: error ? '#EF4444' : telefono.length >= 9 ? '#EC4899' : '#E5E7EB',
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
              style={{ backgroundColor: '#EC4899' }}
            >
              {isPending ? 'Verificando...' : 'Ver mi pedido →'}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            ¿Problemas?{' '}
            <a
              href={`https://wa.me/${whatsappNumero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold"
              style={{ color: '#EC4899' }}
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
    <main className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/"
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
          <IconArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">Seguimiento de pedido</p>
          <p className="font-bold text-gray-900 text-sm">#{orderId}</p>
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
        <p className="text-xs text-gray-400 text-center">{formatDate(pedido.created_at)}</p>

        {/* Timeline card */}
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <IconPackage size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Estado del pedido</h2>
          </div>
          <OrderTimeline estadoActual={pedido.estado} historial={pedido.estado_historial} />
        </div>

        {/* Productos card */}
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Detalle del pedido</h2>
          <div className="flex flex-col gap-3">
            {pedido.pedido_items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-snug">{item.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {item.talla && (
                      <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                        Talla {item.talla}
                      </span>
                    )}
                    {item.color && (
                      <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium capitalize">
                        {item.color}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400">× {item.cantidad}</span>
                  </div>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: '#EC4899' }}>
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 mt-3 border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-600">Total</span>
            <span className="text-lg font-bold" style={{ color: '#EC4899' }}>{formatPrice(pedido.total)}</span>
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

        <p className="text-center text-xs text-gray-400 pb-4">
          Se actualiza automáticamente
        </p>
      </div>
    </main>
  )
}
