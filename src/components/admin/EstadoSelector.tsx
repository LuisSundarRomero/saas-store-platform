'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { IconBrandWhatsapp, IconX, IconCheck } from '@tabler/icons-react'
import { EstadoPedido } from '@/types'
import { updateEstadoPedido } from '@/lib/actions/admin'

const ESTADOS: EstadoPedido[] = ['pendiente', 'empaquetado', 'en_camino', 'entregado']

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pendiente:   'Pendiente',
  empaquetado: 'Empaquetado',
  en_camino:   'En camino',
  entregado:   'Entregado',
}

const ESTADO_EMOJI: Record<EstadoPedido, string> = {
  pendiente:   '⏳',
  empaquetado: '📦',
  en_camino:   '🚚',
  entregado:   '✅',
}

const ESTADO_MSG: Record<EstadoPedido, string> = {
  pendiente:   'Tu pedido está siendo revisado.',
  empaquetado: 'Tu pedido ya está empaquetado y listo para salir.',
  en_camino:   '¡Tu pedido está en camino! Pronto llegará a ti.',
  entregado:   '¡Tu pedido fue entregado! Esperamos que lo disfrutes. 🎀',
}

interface Props {
  pedidoId: string
  estadoActual: EstadoPedido
  clienteTelefono: string
  orderId: string
  whatsappNumero?: string
}

export function EstadoSelector({ pedidoId, estadoActual, clienteTelefono, orderId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [nuevoEstado, setNuevoEstado] = useState<EstadoPedido>(estadoActual)
  const [showModal, setShowModal] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  function handleGuardar() {
    if (nuevoEstado === estadoActual) return
    startTransition(async () => {
      await updateEstadoPedido(pedidoId, nuevoEstado)
      router.refresh()
      setShowModal(true)
    })
  }

  function buildWhatsAppUrl() {
    const telefono = clienteTelefono.replace(/\s/g, '')
    const trackingUrl = appUrl ? `${appUrl}/pedido/${orderId}` : `kuutsu.pe/pedido/${orderId}`
    const mensaje = `Hola! Te escribimos de Kuutsu.pe 🎀\n\nTu pedido *#${orderId}* ha sido actualizado:\n\n${ESTADO_EMOJI[nuevoEstado]} *${ESTADO_LABEL[nuevoEstado]}*\n${ESTADO_MSG[nuevoEstado]}\n\nRastrear tu pedido: ${trackingUrl}`
    return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <select
          value={nuevoEstado}
          onChange={(e) => setNuevoEstado(e.target.value as EstadoPedido)}
          disabled={isPending}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pink-400 bg-white cursor-pointer disabled:opacity-50"
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ESTADO_EMOJI[e]} {ESTADO_LABEL[e]}
            </option>
          ))}
        </select>
        <button
          onClick={handleGuardar}
          disabled={isPending || nuevoEstado === estadoActual}
          className="text-white text-sm font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: '#EC4899' }}
        >
          {isPending ? 'Guardando...' : 'Actualizar'}
        </button>
      </div>

      {/* Modal de notificación WhatsApp */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: '#DCF8C6' }}>
                  {ESTADO_EMOJI[nuevoEstado]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Estado actualizado</p>
                  <p className="text-xs text-gray-400">{ESTADO_LABEL[nuevoEstado]}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                <IconX size={16} />
              </button>
            </div>

            {/* Preview del mensaje */}
            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 mb-2">Mensaje que recibirá el cliente:</p>
              <div className="rounded-xl p-3" style={{ backgroundColor: '#ECE5DD' }}>
                <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {`Hola! Te escribimos de Kuutsu.pe 🎀\n\nTu pedido #${orderId} ha sido actualizado:\n\n${ESTADO_EMOJI[nuevoEstado]} ${ESTADO_LABEL[nuevoEstado]}\n${ESTADO_MSG[nuevoEstado]}\n\nRastrear: ${appUrl || 'kuutsu.pe'}/pedido/${orderId}`}
                  </p>
                  <p className="text-[10px] text-gray-400 text-right mt-1">✓✓</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="px-5 pb-5 flex flex-col gap-2">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowModal(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold text-sm text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                <IconBrandWhatsapp size={18} />
                Enviar notificación al cliente
              </a>
              <button
                onClick={() => setShowModal(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <IconCheck size={14} />
                Solo guardar, no notificar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
