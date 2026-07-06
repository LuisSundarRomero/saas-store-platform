import { createAdminClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { formatPrice } from '@/lib/utils/format'
import Link from 'next/link'
import { IconSearch, IconPhone, IconShoppingBag, IconTrendingUp, IconChevronRight, IconUsers } from '@tabler/icons-react'

export const dynamic = 'force-dynamic'

const ESTADOS_ACTIVOS = ['pago_confirmado', 'empaquetado', 'en_camino', 'entregado']

interface Props {
  searchParams: Promise<{ q?: string; orden?: string }>
}

export default async function ClientesPage({ searchParams }: Props) {
  const { q = '', orden = 'total' } = await searchParams
  const admin = createAdminClient()
  const tenant = await getTenant()

  const { data: pedidos } = await admin
    .from('pedidos')
    .select('id, order_id, total, estado, created_at, cliente_telefono, cliente_nombre')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  // Agrupar por teléfono
  const clienteMap: Record<string, {
    telefono: string
    nombre: string | null
    pedidos: number
    confirmados: number
    totalGastado: number
    ultimoPedido: string
    primerPedido: string
    estados: string[]
  }> = {}

  for (const p of pedidos ?? []) {
    const tel = p.cliente_telefono
    if (!clienteMap[tel]) {
      clienteMap[tel] = {
        telefono: tel,
        nombre: p.cliente_nombre,
        pedidos: 0,
        confirmados: 0,
        totalGastado: 0,
        ultimoPedido: p.created_at,
        primerPedido: p.created_at,
        estados: [],
      }
    }
    const c = clienteMap[tel]
    c.pedidos += 1
    c.estados.push(p.estado)
    if (ESTADOS_ACTIVOS.includes(p.estado)) {
      c.confirmados += 1
      c.totalGastado += p.total ?? 0
    }
    if (p.created_at > c.ultimoPedido) c.ultimoPedido = p.created_at
    if (p.created_at < c.primerPedido) c.primerPedido = p.created_at
    if (!c.nombre && p.cliente_nombre) c.nombre = p.cliente_nombre
  }

  let clientes = Object.values(clienteMap)

  // Filtro por búsqueda
  if (q) clientes = clientes.filter(c =>
    c.telefono.includes(q) || c.nombre?.toLowerCase().includes(q.toLowerCase())
  )

  // Ordenar
  if (orden === 'total') clientes.sort((a, b) => b.totalGastado - a.totalGastado)
  else if (orden === 'pedidos') clientes.sort((a, b) => b.pedidos - a.pedidos)
  else if (orden === 'reciente') clientes.sort((a, b) => b.ultimoPedido.localeCompare(a.ultimoPedido))

  const totalClientes = clientes.length
  const recurrentes = clientes.filter(c => c.pedidos > 1).length
  const ingresoTotal = clientes.reduce((s, c) => s + c.totalGastado, 0)

  const ORDENES = [
    { value: 'total', label: 'Mayor gasto' },
    { value: 'pedidos', label: 'Más pedidos' },
    { value: 'reciente', label: 'Más recientes' },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-sm text-gray-400 mt-0.5">{totalClientes} clientes únicos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total clientes', value: totalClientes, icon: IconUsers, color: '#3B82F6', bg: '#DBEAFE' },
          { label: 'Recurrentes', value: recurrentes, icon: IconShoppingBag, color: '#8B5CF6', bg: '#EDE9FE' },
          { label: 'Ingreso total', value: formatPrice(ingresoTotal), icon: IconTrendingUp, color: '#10B981', bg: '#D1FAE5' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <form className="flex-1 relative">
          <IconSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por teléfono o nombre…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-300 bg-white"
          />
          <input type="hidden" name="orden" value={orden} />
        </form>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {ORDENES.map(({ value, label }) => (
            <a key={value} href={`?orden=${value}&q=${q}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={orden === value
                ? { backgroundColor: '#fff', color: 'var(--color-brand)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: '#9CA3AF' }}>
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cliente</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Primer pedido</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Último pedido</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Pedidos</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total gastado</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clientes.map((c, i) => {
              const esRecurrente = c.pedidos > 1
              const primerFecha = new Date(c.primerPedido).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
              const ultimaFecha = new Date(c.ultimoPedido).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
              return (
                <tr key={c.telefono} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          backgroundColor: i === 0 ? '#FEF3C7' : i === 1 ? '#F3F4F6' : i === 2 ? '#FEF3C7' : '#F3F4F6',
                          color: i === 0 ? '#D97706' : i === 1 ? '#6B7280' : i === 2 ? '#92400E' : '#9CA3AF',
                        }}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gray-800 flex items-center gap-1">
                            <IconPhone size={12} className="text-gray-400" />
                            {c.telefono}
                          </span>
                          {esRecurrente && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">
                              recurrente
                            </span>
                          )}
                        </div>
                        {c.nombre && <p className="text-xs text-gray-400 mt-0.5">{c.nombre}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 hidden sm:table-cell">{primerFecha}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 hidden sm:table-cell">{ultimaFecha}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-bold text-gray-700">{c.pedidos}</span>
                    <span className="text-xs text-gray-400 ml-1">pedidos</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-sm" style={{ color: 'var(--color-brand)' }}>
                    {formatPrice(c.totalGastado)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/clientes/${encodeURIComponent(c.telefono)}`}
                      className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{ backgroundColor: 'var(--color-brand)', color: '#fff' }}
                    >
                      Ver <IconChevronRight size={13} />
                    </Link>
                  </td>
                </tr>
              )
            })}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <IconUsers size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">
                    {q ? `Sin resultados para "${q}"` : 'No hay clientes aún'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
