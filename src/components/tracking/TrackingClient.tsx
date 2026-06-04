'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { IconLock, IconBrandWhatsapp, IconArrowLeft } from '@tabler/icons-react'
import { PedidoConItems } from '@/types'
import { verificarPedido } from '@/lib/actions/pedidos'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { pushEvent } from '@/lib/utils/gtm'
import { OrderTimeline } from './OrderTimeline'

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
      <main className="min-h-screen bg-[--color-surface] flex items-center justify-center px-4">
        <div className="bg-white rounded-[--radius-xl] p-8 max-w-sm w-full text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[--color-brand-light] flex items-center justify-center">
              <IconLock size={28} className="text-[--color-brand]" />
            </div>
          </div>

          <h1 className="text-xl font-semibold mb-1">Rastrea tu pedido</h1>
          <p className="text-sm text-[--color-text-secondary] mb-1">
            Código: <span className="font-semibold text-[--color-text]">#{orderId}</span>
          </p>
          <p className="text-sm text-[--color-text-secondary] mb-6">
            Ingresa el número con el que hiciste el pedido
          </p>

          <div className="flex flex-col gap-3">
            <input
              type="tel"
              placeholder="Ej: 987654321"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerificar()}
              className={`w-full border rounded-[--radius-md] px-3 py-2.5 text-sm outline-none focus:border-[--color-brand] ${
                error ? 'border-[--color-danger]' : 'border-[--color-border]'
              }`}
            />
            {error && (
              <p className="text-xs text-[--color-danger] -mt-1">
                Número incorrecto, intenta de nuevo
              </p>
            )}

            <button
              onClick={handleVerificar}
              disabled={isPending || !telefono.trim()}
              className="w-full bg-[--color-brand] text-white font-semibold py-3 rounded-full hover:bg-[--color-brand-dark] transition-colors disabled:opacity-60"
            >
              {isPending ? 'Verificando...' : 'Ver mi pedido →'}
            </button>
          </div>

          <p className="text-xs text-[--color-text-secondary] mt-6">
            ¿Problemas?{' '}
            <a
              href={`https://wa.me/${whatsappNumero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[--color-brand] font-medium"
            >
              Escríbenos por WhatsApp
            </a>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[--color-surface]">
      {/* Header */}
      <div className="bg-white border-b border-[--color-border] px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-1 hover:bg-[--color-surface] rounded-full">
          <IconArrowLeft size={20} />
        </Link>
        <span className="font-semibold">Pedido #{orderId}</span>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
        {/* Fecha */}
        <p className="text-sm text-[--color-text-secondary]">
          {formatDate(pedido.created_at)}
        </p>

        {/* Timeline */}
        <div className="bg-white rounded-[--radius-lg] p-5 shadow-sm">
          <OrderTimeline estadoActual={pedido.estado} />
        </div>

        {/* Productos */}
        <div className="bg-white rounded-[--radius-lg] p-5 shadow-sm">
          <h2 className="font-semibold mb-3 text-sm">Detalle del pedido</h2>
          <div className="flex flex-col gap-2">
            {pedido.pedido_items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-[--color-text-secondary]">
                  {item.nombre}
                  {item.talla && ` (${item.talla}`}
                  {item.color && `, ${item.color})`}
                  {!item.talla && item.color && ` (${item.color})`}
                  {' '}× {item.cantidad}
                </span>
                <span className="font-medium shrink-0 ml-2">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[--color-border] mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-[--color-brand]">{formatPrice(pedido.total)}</span>
          </div>
        </div>

        {/* CTA WhatsApp */}
        <a
          href={`https://wa.me/${whatsappNumero}?text=${encodeURIComponent(`Hola! Tengo una consulta sobre mi pedido #${orderId}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold py-3.5 rounded-full hover:bg-[#1ebe5d] transition-colors"
        >
          <IconBrandWhatsapp size={20} />
          Preguntar por mi pedido
        </a>
      </div>
    </main>
  )
}
