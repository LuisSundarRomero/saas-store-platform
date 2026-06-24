import { Fragment } from 'react'
import { getPedidos, getPedidosCount } from '@/lib/actions/admin'
import { getTenant } from '@/lib/tenant'
import { createAdminClient } from '@/lib/supabase/server'
import { PedidosTable } from '@/components/admin/PedidosTable'
import { PedidosBuscador } from '@/components/admin/PedidosBuscador'
import { formatPrice } from '@/lib/utils/format'
import Link from 'next/link'

const ESTADOS = ['todos', 'pendiente', 'empaquetado', 'en_camino', 'entregado']
const POR_PAGINA = 10

interface Props {
  searchParams: Promise<{ estado?: string; q?: string; page?: string }>
}

export default async function PedidosPage({ searchParams }: Props) {
  const { estado, q, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1'))

  const tenant = await getTenant()
  const { data: ct } = await createAdminClient().from('config_tienda').select('tienda_nombre').eq('tenant_id', tenant.id).single()
  const tiendaNombre = ct?.tienda_nombre ?? tenant.nombre

  const [todos, pedidosPagina, totalFiltrados] = await Promise.all([
    getPedidos(),
    getPedidos({ estado, search: q, limit: POR_PAGINA, offset: (page - 1) * POR_PAGINA }),
    getPedidosCount({ estado, search: q }),
  ])

  const pendientes = todos.filter((p) => p.estado === 'pendiente').length
  const hoy        = todos.filter((p) => new Date(p.created_at).toDateString() === new Date().toDateString())
  const totalHoy   = hoy.reduce((s, p) => s + p.total, 0)
  const entregados = todos.filter((p) => p.estado === 'entregado').length
  const totalPaginas = Math.ceil(totalFiltrados / POR_PAGINA)

  const stats = [
    { label: 'Pedidos hoy',  value: hoy.length,           sub: 'nuevos',       color: 'var(--color-brand)', bg: '#FEE2E2' },
    { label: 'Pendientes',   value: pendientes,             sub: 'sin atender',  color: '#D97706', bg: '#FEF3C7' },
    { label: 'Ingresos hoy', value: formatPrice(totalHoy), sub: 'total del día', color: '#059669', bg: '#D1FAE5' },
    { label: 'Entregados',   value: entregados,             sub: 'completados',  color: '#6366F1', bg: '#EDE9FE' },
  ]

  function buildUrl(params: Record<string, string>) {
    const p = new URLSearchParams()
    if (estado && estado !== 'todos') p.set('estado', estado)
    if (q) p.set('q', q)
    Object.entries(params).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k))
    return `/admin/pedidos?${p.toString()}`
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gestiona y actualiza el estado de los pedidos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filtros + buscador */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1" style={{ scrollbarWidth: 'none' }}>
          {ESTADOS.map((e) => (
            <Link key={e}
              href={buildUrl({ estado: e === 'todos' ? '' : e, page: '1' })}
              className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize"
              style={
                (estado ?? 'todos') === e
                  ? { backgroundColor: 'var(--color-brand)', color: '#fff' }
                  : { backgroundColor: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }
              }>
              {e === 'todos' ? 'Todos' : e.replace('_', ' ')}
            </Link>
          ))}
        </div>

        <PedidosBuscador defaultValue={q} estado={estado} />
      </div>

      {q && (
        <p className="text-sm text-gray-500 mb-3">
          {totalFiltrados} resultado{totalFiltrados !== 1 ? 's' : ''} para <strong>&quot;{q}&quot;</strong>
          <Link href="/admin/pedidos" className="ml-2 text-red-500 hover:underline text-xs">Limpiar</Link>
        </p>
      )}

      <PedidosTable pedidos={pedidosPagina} tiendaNombre={tiendaNombre} />

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Mostrando {(page - 1) * POR_PAGINA + 1}–{Math.min(page * POR_PAGINA, totalFiltrados)} de {totalFiltrados} pedidos
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors">
                ← Anterior
              </Link>
            )}
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPaginas || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <Fragment key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="px-2 py-2 text-sm text-gray-400">…</span>
                  )}
                  <Link href={buildUrl({ page: String(p) })}
                    className="w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-xl transition-colors"
                    style={p === page
                      ? { backgroundColor: 'var(--color-brand)', color: '#fff' }
                      : { border: '1px solid #E5E7EB', color: '#6B7280' }}>
                    {p}
                  </Link>
                </Fragment>
              ))}
            {page < totalPaginas && (
              <Link href={buildUrl({ page: String(page + 1) })}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors">
                Siguiente →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
