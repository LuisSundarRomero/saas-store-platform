import { createAdminClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { formatPrice } from '@/lib/utils/format'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  IconArrowLeft, IconPhone, IconShoppingBag, IconTrendingUp,
  IconReceipt, IconCalendar, IconBrandWhatsapp, IconChevronRight,
} from '@tabler/icons-react'

export const dynamic = 'force-dynamic'

const ESTADOS_ACTIVOS = ['pago_confirmado', 'empaquetado', 'en_camino', 'entregado']

const ESTADO_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pendiente:        { bg: '#FEF3C7', color: '#92400E', label: 'Pendiente' },
  pago_confirmado:  { bg: '#FEE2E2', color: '#991B1B', label: 'Pago confirmado' },
  empaquetado:      { bg: '#DBEAFE', color: '#1D4ED8', label: 'Empaquetado' },
  en_camino:        { bg: '#EDE9FE', color: '#5B21B6', label: 'En camino' },
  entregado:        { bg: '#D1FAE5', color: '#065F46', label: 'Entregado' },
}

interface Props {
  params: Promise<{ telefono: string }>
}

export default async function ClienteDetallePage({ params }: Props) {
  const { telefono: telefonoEncoded } = await params
  const telefono = decodeURIComponent(telefonoEncoded)

  const admin = createAdminClient()
  const tenant = await getTenant()

  const { data: pedidos } = await admin
    .from('pedidos')
    .select('id, order_id, total, estado, created_at, cliente_nombre, cliente_direccion, pedido_items(nombre, cantidad, talla, color, subtotal)')
    .eq('tenant_id', tenant.id)
    .eq('cliente_telefono', telefono)
    .order('created_at', { ascending: false })

  if (!pedidos || pedidos.length === 0) notFound()

  const nombre = pedidos.find(p => p.cliente_nombre)?.cliente_nombre ?? null
  const direccion = pedidos.find(p => p.cliente_direccion)?.cliente_direccion ?? null

  const confirmados = pedidos.filter(p => ESTADOS_ACTIVOS.includes(p.estado))
  const totalGastado = confirmados.reduce((s, p) => s + (p.total ?? 0), 0)
  const ticket = confirmados.length > 0 ? totalGastado / confirmados.length : 0
  const primerPedido = pedidos[pedidos.length - 1].created_at
  const ultimoPedido = pedidos[0].created_at

  // Productos más comprados
  const prodMap: Record<string, number> = {}
  for (const p of confirmados) {
    for (const item of p.pedido_items ?? []) {
      prodMap[item.nombre] = (prodMap[item.nombre] ?? 0) + item.cantidad
    }
  }
  const topProds = Object.entries(prodMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const waUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(`Hola! Te escribimos de ${tenant.nombre} 🛍️`)}`

  return (
    <div className="p-4 sm:p-6 max-w-[1000px] mx-auto">

      {/* Back */}
      <Link href="/admin/clientes"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-5">
        <IconArrowLeft size={14} /> Volver a Clientes
      </Link>

      {/* Header cliente */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
              style={{ backgroundColor: '#FEE2E2', color: 'var(--color-brand)' }}>
              {(nombre ?? telefono).charAt(0).toUpperCase()}
            </div>
            <div>
              {nombre && <p className="font-bold text-gray-900 text-lg leading-tight">{nombre}</p>}
              <div className="flex items-center gap-1.5 mt-0.5">
                <IconPhone size={13} className="text-gray-400" />
                <span className="font-mono font-semibold text-gray-700 text-sm">{telefono}</span>
              </div>
              {direccion && (
                <p className="text-xs text-gray-400 mt-1">📍 {direccion}</p>
              )}
            </div>
          </div>
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}>
            <IconBrandWhatsapp size={16} />
            Escribir por WhatsApp
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total gastado', value: formatPrice(totalGastado), icon: IconTrendingUp, color: '#10B981', bg: '#D1FAE5' },
          { label: 'Pedidos totales', value: pedidos.length, icon: IconShoppingBag, color: '#3B82F6', bg: '#DBEAFE' },
          { label: 'Ticket promedio', value: formatPrice(ticket), icon: IconReceipt, color: '#8B5CF6', bg: '#EDE9FE' },
          { label: 'Cliente desde', value: new Date(primerPedido).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }), icon: IconCalendar, color: '#F59E0B', bg: '#FEF3C7' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Historial de pedidos */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-700 px-1">
            Historial de compras <span className="text-gray-400 font-normal">({pedidos.length})</span>
          </h2>

          {pedidos.map((p) => {
            const badge = ESTADO_BADGE[p.estado] ?? { bg: '#F3F4F6', color: '#6B7280', label: p.estado }
            const fecha = new Date(p.created_at).toLocaleDateString('es-PE', {
              day: '2-digit', month: 'long', year: 'numeric',
            })
            const hora = new Date(p.created_at).toLocaleTimeString('es-PE', {
              hour: '2-digit', minute: '2-digit',
            })
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                {/* Cabecera pedido */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/pedidos/${p.order_id}`}
                      className="font-bold text-sm hover:underline"
                      style={{ color: 'var(--color-brand)' }}>
                      #{p.order_id}
                    </Link>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: 'var(--color-brand)' }}>{formatPrice(p.total)}</p>
                    <p className="text-[10px] text-gray-400">{fecha} · {hora}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-1.5">
                  {(p.pedido_items ?? []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gray-400">×{item.cantidad}</span>
                        <span className="text-gray-700 font-medium truncate">{item.nombre}</span>
                        {(item.talla || item.color) && (
                          <div className="flex items-center gap-1">
                            {item.talla && <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{item.talla}</span>}
                            {item.color && <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{item.color}</span>}
                          </div>
                        )}
                      </div>
                      <span className="text-gray-500 shrink-0 ml-2">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
                  <Link href={`/admin/pedidos/${p.order_id}`}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                    Ver detalle completo <IconChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Panel derecho */}
        <div className="flex flex-col gap-4">

          {/* Productos favoritos */}
          {topProds.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-800 mb-3">Productos favoritos</p>
              <div className="flex flex-col gap-2.5">
                {topProds.map(([nombre, cantidad]) => (
                  <div key={nombre} className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-700 truncate flex-1">{nombre}</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
                      ×{cantidad}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline de actividad */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-800 mb-3">Actividad</p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Primer pedido</span>
                <span className="font-semibold text-gray-700">
                  {new Date(primerPedido).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Último pedido</span>
                <span className="font-semibold text-gray-700">
                  {new Date(ultimoPedido).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Pedidos confirmados</span>
                <span className="font-semibold text-gray-700">{confirmados.length} / {pedidos.length}</span>
              </div>
              {pedidos.length > 1 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Frecuencia</span>
                  <span className="font-semibold" style={{ color: '#8B5CF6' }}>
                    {pedidos.length > 1
                      ? `cada ~${Math.round((new Date(ultimoPedido).getTime() - new Date(primerPedido).getTime()) / (1000 * 60 * 60 * 24 * (pedidos.length - 1)))} días`
                      : '—'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
