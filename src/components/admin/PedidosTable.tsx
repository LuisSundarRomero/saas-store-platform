'use client'

import Link from 'next/link'
import { useState, useTransition, useRef } from 'react'
import { EstadoPedido } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { updateEstadoPedido } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import { IconBrandWhatsapp, IconCheck, IconX, IconUpload } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'

const BADGE: Record<EstadoPedido, { bg: string; color: string }> = {
  pendiente:        { bg: '#FEF3C7', color: '#92400E' },
  pago_confirmado:  { bg: '#FCE7F3', color: '#BE185D' },
  empaquetado:      { bg: '#DBEAFE', color: '#1D4ED8' },
  en_camino:        { bg: '#EDE9FE', color: '#5B21B6' },
  entregado:        { bg: '#D1FAE5', color: '#065F46' },
}

const ESTADOS: EstadoPedido[] = ['pendiente', 'pago_confirmado', 'empaquetado', 'en_camino', 'entregado']

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pendiente:        'Pendiente',
  pago_confirmado:  'Pago confirmado',
  empaquetado:      'Empaquetado',
  en_camino:        'En camino',
  entregado:        'Entregado',
}

const ESTADO_EMOJI: Record<EstadoPedido, string> = {
  pendiente:        '⏳',
  pago_confirmado:  '💳',
  empaquetado:      '📦',
  en_camino:        '🚚',
  entregado:        '✅',
}

const ESTADO_MSG: Record<EstadoPedido, string> = {
  pendiente:        'Tu pedido está siendo revisado.',
  pago_confirmado:  'Hemos recibido tu pago. ¡Gracias!',
  empaquetado:      'Tu pedido ya está empaquetado y listo para salir.',
  en_camino:        '¡Tu pedido está en camino! Pronto llegará a ti.',
  entregado:        '¡Tu pedido fue entregado! Esperamos que lo disfrutes. 🎀',
}

interface ModalInfo {
  orderId: string
  clienteTelefono: string
  nuevoEstado: EstadoPedido
}

interface ComprobanteModalInfo {
  pedidoId: string
  orderId: string
}

interface Props { pedidos: any[] }

export function PedidosTable({ pedidos }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modal, setModal] = useState<ModalInfo | null>(null)
  const [comprobanteModal, setComprobanteModal] = useState<ComprobanteModalInfo | null>(null)
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null)
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  function handleEstado(pedidoId: string, nuevoEstado: EstadoPedido, orderId: string, clienteTelefono: string) {
    if (nuevoEstado === 'pago_confirmado') {
      setComprobanteModal({ pedidoId, orderId })
      setComprobanteFile(null)
      setComprobantePreview(null)
      setUploadError('')
      return
    }
    startTransition(async () => {
      await updateEstadoPedido(pedidoId, nuevoEstado)
      router.refresh()
      setModal({ orderId, clienteTelefono, nuevoEstado })
    })
  }

  function handleComprobanteFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setComprobanteFile(f)
    setComprobantePreview(URL.createObjectURL(f))
    setUploadError('')
  }

  function handleGuardarComprobante(omitir = false) {
    if (!comprobanteModal) return
    startTransition(async () => {
      let comprobanteUrl: string | undefined
      if (!omitir && comprobanteFile) {
        const supabase = createClient()
        const ext = comprobanteFile.name.split('.').pop()
        const path = `comprobantes/${comprobanteModal.orderId}-${Date.now()}.${ext}`
        const { data, error } = await supabase.storage
          .from('comprobantes')
          .upload(path, comprobanteFile, { upsert: true })
        if (error) {
          setUploadError('Error al subir imagen: ' + error.message)
          return
        }
        const { data: urlData } = supabase.storage.from('comprobantes').getPublicUrl(data.path)
        comprobanteUrl = urlData.publicUrl
      }
      await updateEstadoPedido(comprobanteModal.pedidoId, 'pago_confirmado', comprobanteUrl)
      router.refresh()
      setComprobanteModal(null)
      setComprobanteFile(null)
      setComprobantePreview(null)
    })
  }

  function buildWhatsAppUrl(info: ModalInfo) {
    const telefono = info.clienteTelefono.replace(/\s/g, '')
    const trackingUrl = appUrl ? `${appUrl}/pedido/${info.orderId}` : `kuutsu.pe/pedido/${info.orderId}`
    const mensaje = `Hola! Te escribimos de Kuutsu.pe 🎀\n\nTu pedido *#${info.orderId}* ha sido actualizado:\n\n${ESTADO_EMOJI[info.nuevoEstado]} *${ESTADO_LABEL[info.nuevoEstado]}*\n${ESTADO_MSG[info.nuevoEstado]}\n\nRastrear tu pedido: ${trackingUrl}`
    return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
  }

  if (pedidos.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="font-medium">No hay pedidos</p>
      </div>
    )
  }

  return (
    <>
      {/* ── MOBILE: tarjetas ── */}
      <div className="flex flex-col gap-3 lg:hidden">
        {pedidos.map((p) => {
          const badge = BADGE[p.estado as EstadoPedido]
          return (
            <div key={p.id}
              className="bg-white rounded-xl border border-gray-100 p-4"
              style={p.estado === 'pendiente' ? { borderLeft: '3px solid #EC4899' } : {}}>
              <div className="flex items-start justify-between mb-2">
                <Link href={`/admin/pedidos/${p.order_id}`}
                  className="font-bold text-base" style={{ color: '#EC4899' }}>
                  #{p.order_id}
                </Link>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{ backgroundColor: badge.bg, color: badge.color }}>
                  {p.estado.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">📱 {p.cliente_telefono}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="font-bold" style={{ color: '#EC4899' }}>{formatPrice(p.total)}</span>
                <select
                  value={p.estado}
                  onChange={(e) => handleEstado(p.id, e.target.value as EstadoPedido, p.order_id, p.cliente_telefono)}
                  disabled={isPending}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none bg-white cursor-pointer"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e} className="capitalize">
                      {e.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400 mt-2">{formatDate(p.created_at)}</p>
            </div>
          )
        })}
      </div>

      {/* ── DESKTOP: tabla ── */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-400">Pedido</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-400">Teléfono</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-400">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-400">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-400">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pedidos.map((p) => {
                const badge = BADGE[p.estado as EstadoPedido]
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors"
                    style={p.estado === 'pendiente' ? { borderLeft: '2px solid #EC4899' } : {}}>
                    <td className="px-4 py-3">
                      <Link href={`/admin/pedidos/${p.order_id}`}
                        className="font-semibold hover:underline" style={{ color: '#EC4899' }}>
                        #{p.order_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.cliente_telefono}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#EC4899' }}>{formatPrice(p.total)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                        style={{ backgroundColor: badge.bg, color: badge.color }}>
                        {p.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={p.estado}
                        onChange={(e) => handleEstado(p.id, e.target.value as EstadoPedido, p.order_id, p.cliente_telefono)}
                        disabled={isPending}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none bg-white cursor-pointer"
                      >
                        {ESTADOS.map((e) => (
                          <option key={e} value={e} className="capitalize">
                            {e.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Comprobante (pago_confirmado) ── */}
      {comprobanteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setComprobanteModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: '#FCE7F3' }}>
                  💳
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Pago confirmado</p>
                  <p className="text-xs text-gray-400">#{comprobanteModal.orderId}</p>
                </div>
              </div>
              <button onClick={() => setComprobanteModal(null)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                <IconX size={16} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 mb-3">
                Sube la captura del Yape / Plin / transferencia (opcional)
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleComprobanteFileChange}
              />

              {comprobantePreview ? (
                <div className="relative inline-block mb-3">
                  <img src={comprobantePreview} alt="Comprobante"
                    className="h-40 w-full object-cover rounded-xl border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => { setComprobanteFile(null); setComprobantePreview(null) }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow">
                    <IconX size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-pink-300 hover:text-pink-500 transition-colors mb-3"
                >
                  <IconUpload size={22} />
                  <span className="text-sm font-medium">Subir captura de pago</span>
                  <span className="text-xs">JPG, PNG o WEBP</span>
                </button>
              )}

              {uploadError && <p className="text-xs text-red-500 mb-2">{uploadError}</p>}
            </div>

            <div className="px-5 pb-5 flex flex-col gap-2">
              <button
                onClick={() => handleGuardarComprobante(false)}
                disabled={isPending}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#EC4899' }}
              >
                <IconCheck size={16} />
                {isPending ? 'Guardando...' : 'Guardar estado'}
              </button>
              <button
                onClick={() => handleGuardarComprobante(true)}
                disabled={isPending}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Omitir imagen y guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal WhatsApp ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: '#DCF8C6' }}>
                  {ESTADO_EMOJI[modal.nuevoEstado]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Estado actualizado</p>
                  <p className="text-xs text-gray-400">#{modal.orderId} · {ESTADO_LABEL[modal.nuevoEstado]}</p>
                </div>
              </div>
              <button onClick={() => setModal(null)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                <IconX size={16} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 mb-2">Mensaje que recibirá el cliente:</p>
              <div className="rounded-xl p-3" style={{ backgroundColor: '#ECE5DD' }}>
                <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
                  <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {`Hola! Te escribimos de Kuutsu.pe 🎀\n\nTu pedido #${modal.orderId} ha sido actualizado:\n\n${ESTADO_EMOJI[modal.nuevoEstado]} ${ESTADO_LABEL[modal.nuevoEstado]}\n${ESTADO_MSG[modal.nuevoEstado]}\n\nRastrear: ${appUrl || 'kuutsu.pe'}/pedido/${modal.orderId}`}
                  </p>
                  <p className="text-[10px] text-gray-400 text-right mt-1">✓✓</p>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 flex flex-col gap-2">
              <a
                href={buildWhatsAppUrl(modal)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setModal(null)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-semibold text-sm text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                <IconBrandWhatsapp size={18} />
                Enviar notificación al cliente
              </a>
              <button
                onClick={() => setModal(null)}
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
