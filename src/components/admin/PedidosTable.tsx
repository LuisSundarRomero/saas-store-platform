'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { EstadoPedido } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { updateEstadoPedido } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

const BADGE: Record<EstadoPedido, { bg: string; color: string }> = {
  pendiente:   { bg: '#FEF3C7', color: '#92400E' },
  empaquetado: { bg: '#DBEAFE', color: '#1D4ED8' },
  en_camino:   { bg: '#EDE9FE', color: '#5B21B6' },
  entregado:   { bg: '#D1FAE5', color: '#065F46' },
}

const ESTADOS: EstadoPedido[] = ['pendiente', 'empaquetado', 'en_camino', 'entregado']

interface Props { pedidos: any[] }

export function PedidosTable({ pedidos }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleEstado(pedidoId: string, estado: EstadoPedido) {
    startTransition(async () => {
      await updateEstadoPedido(pedidoId, estado)
      router.refresh()
    })
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
                  onChange={(e) => handleEstado(p.id, e.target.value as EstadoPedido)}
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
                        onChange={(e) => handleEstado(p.id, e.target.value as EstadoPedido)}
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
    </>
  )
}
