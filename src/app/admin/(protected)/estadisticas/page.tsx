import { createAdminClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { formatPrice } from '@/lib/utils/format'
import Link from 'next/link'
import {
  IconTrendingUp, IconTrendingDown, IconShoppingBag,
  IconReceipt, IconAlertCircle, IconBrandWhatsapp,
  IconCreditCard, IconMinus, IconChevronRight,
} from '@tabler/icons-react'

export const dynamic = 'force-dynamic'

const ESTADOS_ACTIVOS = ['pago_confirmado', 'empaquetado', 'en_camino', 'entregado']

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente', pago_confirmado: 'Pago confirmado',
  empaquetado: 'Empaquetado', en_camino: 'En camino', entregado: 'Entregado',
}
const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#F59E0B', pago_confirmado: '#EF4444',
  empaquetado: '#3B82F6', en_camino: '#8B5CF6', entregado: '#10B981',
}

interface Props {
  searchParams: Promise<{ periodo?: string }>
}

function pct(a: number, b: number) {
  if (b === 0) return a > 0 ? 100 : 0
  return Math.round(((a - b) / b) * 100)
}

function fmtFecha(iso: string, dias: number) {
  const d = new Date(iso + 'T12:00:00')
  if (dias <= 14) return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
  if (dias <= 31) return d.toLocaleDateString('es-PE', { day: '2-digit' })
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

export default async function EstadisticasPage({ searchParams }: Props) {
  const { periodo = '30' } = await searchParams
  const dias = parseInt(periodo) || 30
  const admin = createAdminClient()
  const tenant = await getTenant()
  const tid = tenant.id

  const ahora = new Date()
  const desde = new Date(ahora); desde.setDate(ahora.getDate() - dias)
  const desdeAnterior = new Date(desde); desdeAnterior.setDate(desde.getDate() - dias)

  const [
    { data: pedidosPeriodo },
    { data: pedidosAnterior },
    { data: pedidosTodos },
    { data: itemsPeriodo },
    { data: categorias },
    { count: pendientes },
    { count: totalProductos },
  ] = await Promise.all([
    admin.from('pedidos').select('id, total, estado, created_at, metodo_pago, cliente_telefono')
      .eq('tenant_id', tid).gte('created_at', desde.toISOString()),
    admin.from('pedidos').select('id, total, estado')
      .eq('tenant_id', tid)
      .gte('created_at', desdeAnterior.toISOString())
      .lt('created_at', desde.toISOString()),
    admin.from('pedidos').select('estado').eq('tenant_id', tid),
    admin.from('pedido_items')
      .select('nombre, cantidad, subtotal, pedidos!inner(estado, created_at)')
      .eq('tenant_id', tid)
      .gte('pedidos.created_at', desde.toISOString())
      .in('pedidos.estado', ESTADOS_ACTIVOS),
    admin.from('categorias').select('id, nombre').eq('tenant_id', tid),
    admin.from('pedidos').select('*', { count: 'exact', head: true })
      .eq('tenant_id', tid).eq('estado', 'pendiente'),
    admin.from('productos').select('*', { count: 'exact', head: true })
      .eq('tenant_id', tid).eq('visible', true),
  ])

  // ── KPIs actuales ───────────────────────────────────────────
  const activos = (pedidosPeriodo ?? []).filter(p => ESTADOS_ACTIVOS.includes(p.estado))
  const ingresos = activos.reduce((s, p) => s + (p.total ?? 0), 0)
  const totalPed = pedidosPeriodo?.length ?? 0
  const ticket = activos.length > 0 ? ingresos / activos.length : 0
  const entregados = (pedidosPeriodo ?? []).filter(p => p.estado === 'entregado').length
  const tasaEntrega = activos.length > 0 ? Math.round((entregados / activos.length) * 100) : 0

  // ── KPIs período anterior (comparación) ─────────────────────
  const activosAnt = (pedidosAnterior ?? []).filter(p => ESTADOS_ACTIVOS.includes(p.estado))
  const ingresosAnt = activosAnt.reduce((s, p) => s + (p.total ?? 0), 0)
  const totalPedAnt = pedidosAnterior?.length ?? 0
  const ticketAnt = activosAnt.length > 0 ? ingresosAnt / activosAnt.length : 0

  // ── Gráfico ingresos por día ─────────────────────────────────
  const ingresosDia: Record<string, number> = {}
  const pedidosDia: Record<string, number> = {}
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(ahora); d.setDate(ahora.getDate() - i)
    const k = d.toISOString().split('T')[0]
    ingresosDia[k] = 0; pedidosDia[k] = 0
  }
  for (const p of activos) {
    const k = new Date(p.created_at).toISOString().split('T')[0]
    if (k in ingresosDia) { ingresosDia[k] += p.total ?? 0; pedidosDia[k] += 1 }
  }
  const diasData = Object.entries(ingresosDia).map(([fecha, total]) => ({
    fecha, total, pedidos: pedidosDia[fecha],
  }))
  const maxDia = Math.max(...diasData.map(d => d.total), 1)

  // ── Top productos ────────────────────────────────────────────
  const prodMap: Record<string, { cantidad: number; subtotal: number }> = {}
  for (const item of itemsPeriodo ?? []) {
    if (!prodMap[item.nombre]) prodMap[item.nombre] = { cantidad: 0, subtotal: 0 }
    prodMap[item.nombre].cantidad += item.cantidad
    prodMap[item.nombre].subtotal += item.subtotal
  }
  const topProductos = Object.entries(prodMap)
    .sort((a, b) => b[1].subtotal - a[1].subtotal).slice(0, 8)
  const maxProd = Math.max(...topProductos.map(([, v]) => v.subtotal), 1)

  // ── Distribución estado global ───────────────────────────────
  const estadoCount: Record<string, number> = {}
  for (const p of pedidosTodos ?? []) estadoCount[p.estado] = (estadoCount[p.estado] ?? 0) + 1
  const totalGlobal = Object.values(estadoCount).reduce((a, b) => a + b, 0)

  // ── Método de pago ───────────────────────────────────────────
  const metodo: Record<string, number> = {}
  for (const p of pedidosPeriodo ?? []) {
    const m = p.metodo_pago ?? 'whatsapp'
    metodo[m] = (metodo[m] ?? 0) + 1
  }

  // ── Clientes únicos y top clientes ──────────────────────────
  const clienteMap: Record<string, { pedidos: number; total: number }> = {}
  for (const p of activos) {
    const t = p.cliente_telefono
    if (!clienteMap[t]) clienteMap[t] = { pedidos: 0, total: 0 }
    clienteMap[t].pedidos += 1; clienteMap[t].total += p.total ?? 0
  }
  const clientesUnicos = Object.keys(clienteMap).length
  const topClientes = Object.entries(clienteMap)
    .sort((a, b) => b[1].total - a[1].total).slice(0, 5)
  const recurrentes = Object.values(clienteMap).filter(c => c.pedidos > 1).length

  // ── Mejor día ───────────────────────────────────────────────
  const mejorDia = diasData.reduce((best, d) => d.total > best.total ? d : best, diasData[0] ?? { fecha: '', total: 0, pedidos: 0 })

  const PERIODOS = [{ label: '7d', value: '7' }, { label: '30d', value: '30' }, { label: '90d', value: '90' }]

  function Delta({ actual, anterior }: { actual: number; anterior: number }) {
    const diff = pct(actual, anterior)
    if (anterior === 0) return null
    const up = diff >= 0
    const Icon = diff === 0 ? IconMinus : up ? IconTrendingUp : IconTrendingDown
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: up ? '#D1FAE5' : '#FEE2E2', color: up ? '#065F46' : '#991B1B' }}>
        <Icon size={11} />
        {Math.abs(diff)}%
      </span>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {desde.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} — {ahora.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {PERIODOS.map(({ label, value }) => (
            <a key={value} href={`?periodo=${value}`}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={periodo === value
                ? { backgroundColor: '#fff', color: 'var(--color-brand)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: '#9CA3AF' }}>
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: 'Ingresos', value: formatPrice(ingresos),
            icon: IconTrendingUp, color: '#10B981', bg: '#D1FAE5',
            sub: `${activos.length} pedidos confirmados`,
            delta: <Delta actual={ingresos} anterior={ingresosAnt} />,
          },
          {
            label: 'Pedidos', value: totalPed,
            icon: IconShoppingBag, color: '#3B82F6', bg: '#DBEAFE',
            sub: `vs ${totalPedAnt} período anterior`,
            delta: <Delta actual={totalPed} anterior={totalPedAnt} />,
          },
          {
            label: 'Ticket promedio', value: formatPrice(ticket),
            icon: IconReceipt, color: '#8B5CF6', bg: '#EDE9FE',
            sub: 'por pedido confirmado',
            delta: <Delta actual={ticket} anterior={ticketAnt} />,
          },
          {
            label: 'Tasa de entrega', value: `${tasaEntrega}%`,
            icon: IconAlertCircle, color: '#F59E0B', bg: '#FEF3C7',
            sub: `${pendientes ?? 0} pendientes sin atender`,
            delta: null,
          },
        ].map(({ label, value, icon: Icon, color, bg, sub, delta }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {delta}
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fila 2: Gráfico + Estados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Gráfico de barras */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-gray-800">Ingresos por día</p>
              <p className="text-xs text-gray-400 mt-0.5">Solo pedidos confirmados</p>
            </div>
            {mejorDia.total > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Mejor día</p>
                <p className="text-xs font-semibold text-gray-700">
                  {new Date(mejorDia.fecha + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} · {formatPrice(mejorDia.total)}
                </p>
              </div>
            )}
          </div>

          {/* Y-axis labels + bars */}
          <div className="flex gap-2">
            <div className="flex flex-col justify-between text-right pb-5 w-12 shrink-0">
              {[maxDia, maxDia * 0.5, 0].map((v, i) => (
                <p key={i} className="text-[9px] text-gray-300 leading-none">{v > 0 ? formatPrice(v) : 'S/ 0'}</p>
              ))}
            </div>
            <div className="flex-1">
              <div className="relative h-36 flex items-end gap-0.5">
                {/* Gridlines */}
                {[0, 50, 100].map(pct => (
                  <div key={pct} className="absolute w-full border-t border-gray-100 pointer-events-none"
                    style={{ bottom: `${pct}%` }} />
                ))}
                {diasData.map(({ fecha, total, pedidos }) => {
                  const h = total > 0 ? Math.max((total / maxDia) * 100, 3) : 0
                  return (
                    <div key={fecha} className="flex-1 flex items-end group relative">
                      {/* Tooltip */}
                      {total > 0 && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                          <p className="font-semibold">{formatPrice(total)}</p>
                          <p className="text-gray-400">{pedidos} pedido{pedidos !== 1 ? 's' : ''}</p>
                        </div>
                      )}
                      <div className="w-full rounded-t transition-all duration-200 cursor-default"
                        style={{
                          height: `${h}%`,
                          background: total > 0
                            ? `linear-gradient(to top, var(--color-brand), color-mix(in srgb, var(--color-brand) 60%, white))`
                            : '#F3F4F6',
                        }} />
                    </div>
                  )
                })}
              </div>
              {/* X-axis */}
              <div className="flex gap-0.5 mt-1.5">
                {diasData.map(({ fecha }, i) => {
                  const show = dias <= 14 || i === 0 || i === diasData.length - 1 || i % Math.ceil(dias / 8) === 0
                  return (
                    <div key={fecha} className="flex-1 text-center">
                      {show && <p className="text-[9px] text-gray-300 truncate">{fmtFecha(fecha, dias)}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Distribución por estado */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-800 mb-1">Pedidos por estado</p>
          <p className="text-xs text-gray-400 mb-4">Total histórico — {totalGlobal} pedidos</p>
          <div className="flex flex-col gap-3.5">
            {Object.entries(estadoCount)
              .sort((a, b) => b[1] - a[1])
              .map(([estado, count]) => (
                <div key={estado}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ESTADO_COLOR[estado] ?? '#6B7280' }} />
                      <span className="text-xs font-medium text-gray-600">{ESTADO_LABEL[estado] ?? estado}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">{Math.round((count / totalGlobal) * 100)}%</span>
                      <span className="text-xs font-bold text-gray-700 w-5 text-right">{count}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(count / totalGlobal) * 100}%`, backgroundColor: ESTADO_COLOR[estado] ?? '#6B7280' }} />
                  </div>
                </div>
              ))}
            {!totalGlobal && <p className="text-sm text-gray-400 text-center py-6">Sin pedidos aún</p>}
          </div>
        </div>
      </div>

      {/* Fila 3: Productos + Clientes + Pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top productos */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-800 mb-1">Top productos</p>
          <p className="text-xs text-gray-400 mb-4">Por ingreso generado</p>
          {topProductos.length === 0
            ? <p className="text-sm text-gray-400 text-center py-8">Sin ventas en este período</p>
            : (
              <div className="flex flex-col gap-3">
                {topProductos.map(([nombre, { cantidad, subtotal }], i) => (
                  <div key={nombre} className="flex items-center gap-2.5">
                    <span className="text-xs font-bold w-4 shrink-0 text-center"
                      style={{ color: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : i === 2 ? '#92400E' : '#D1D5DB' }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{nombre}</p>
                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          <span className="text-[10px] text-gray-400">{cantidad} uds</span>
                          <span className="text-xs font-bold" style={{ color: 'var(--color-brand)' }}>{formatPrice(subtotal)}</span>
                        </div>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{
                            width: `${(subtotal / maxProd) * 100}%`,
                            background: `linear-gradient(to right, var(--color-brand), color-mix(in srgb, var(--color-brand) 50%, white))`,
                          }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Clientes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-800">Clientes</p>
            <Link href="/admin/clientes" className="text-xs font-medium hover:underline" style={{ color: 'var(--color-brand)' }}>
              Ver todos →
            </Link>
          </div>
          <p className="text-xs text-gray-400 mb-4">Pedidos confirmados del período</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Únicos', value: clientesUnicos, color: '#3B82F6' },
              { label: 'Recurrentes', value: recurrentes, color: '#8B5CF6' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {topClientes.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Top clientes</p>
              <div className="flex flex-col gap-1.5">
                {topClientes.map(([tel, { pedidos: nped, total }]) => (
                  <Link key={tel} href={`/admin/clientes/${encodeURIComponent(tel)}`}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-gray-700">{tel}</span>
                      {nped > 1 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">
                          ×{nped}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold" style={{ color: 'var(--color-brand)' }}>{formatPrice(total)}</span>
                      <IconChevronRight size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagos + Resumen */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-800 mb-4">Método de pago</p>
            <div className="flex flex-col gap-3">
              {[
                { key: 'whatsapp', label: 'WhatsApp', icon: IconBrandWhatsapp, color: '#25D366' },
                { key: 'culqi', label: 'Culqi / Tarjeta', icon: IconCreditCard, color: '#6366F1' },
              ].map(({ key, label, icon: Icon, color }) => {
                const count = metodo[key] ?? 0
                const p = totalPed > 0 ? Math.round((count / totalPed) * 100) : 0
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Icon size={14} style={{ color }} />
                        <span className="text-xs font-medium text-gray-600">{label}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700">{count} <span className="text-gray-400 font-normal">({p}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, backgroundColor: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex-1">
            <p className="text-sm font-semibold text-gray-800 mb-4">Resumen</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Productos activos', value: (totalProductos ?? 0).toString() },
                { label: 'Ingreso / día (prom.)', value: formatPrice(ingresos / dias) },
                { label: 'Tasa confirmación', value: totalPed > 0 ? `${Math.round((activos.length / totalPed) * 100)}%` : '—' },
                { label: 'Tasa entrega', value: activos.length > 0 ? `${tasaEntrega}%` : '—' },
                { label: 'Clientes únicos', value: clientesUnicos.toString() },
                { label: 'Tasa recurrencia', value: clientesUnicos > 0 ? `${Math.round((recurrentes / clientesUnicos) * 100)}%` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-bold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
