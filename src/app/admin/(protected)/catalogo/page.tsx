import Link from 'next/link'
import { IconPlus } from '@tabler/icons-react'
import { getProductosAdmin, getCategorias } from '@/lib/actions/admin'
import { CatalogoAdminTable } from '@/components/admin/CatalogoAdminTable'
import { CatalogoBuscador } from '@/components/admin/CatalogoBuscador'
import { AutoPageSize } from '@/components/admin/AutoPageSize'
import { Suspense } from 'react'
import type { Producto, Categoria } from '@/types'

interface Props {
  searchParams: Promise<{ q?: string; cat?: string; filtro?: string; page?: string; size?: string }>
}

export default async function CatalogoAdminPage({ searchParams }: Props) {
  const { q, cat, filtro, page: pageStr, size: sizeStr } = await searchParams
  const POR_PAGINA = Math.min(Math.max(parseInt(sizeStr ?? '12'), 4), 50)
  const page = Math.max(1, parseInt(pageStr ?? '1'))

  const [todosLosProductos, productosPagina, categorias] = await Promise.all([
    getProductosAdmin({ q, categoriaSlug: cat, filtro }),
    getProductosAdmin({ q, categoriaSlug: cat, filtro, limit: POR_PAGINA, offset: (page - 1) * POR_PAGINA }),
    getCategorias(),
  ])

  const total = todosLosProductos.length
  const totalPaginas = Math.ceil(total / POR_PAGINA)
  const visibles  = todosLosProductos.filter((p: Producto) => p.visible).length
  const agotados  = todosLosProductos.filter((p: Producto) => p.stock === 0).length
  const destacados = todosLosProductos.filter((p: Producto) => p.destacado).length

  function buildUrl(params: Record<string, string>) {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (cat) p.set('cat', cat)
    if (filtro) p.set('filtro', filtro)
    if (sizeStr) p.set('size', sizeStr)
    Object.entries(params).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k))
    return `/admin/catalogo?${p.toString()}`
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total} productos · {visibles} visibles · {destacados} destacados
            {agotados > 0 && <span className="text-red-400 ml-1">· {agotados} agotados</span>}
          </p>
        </div>
        <Link href="/admin/catalogo/nuevo"
          className="flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#E11D2E', boxShadow: '0 2px 12px rgba(225,29,46,0.3)' }}>
          <IconPlus size={16} />
          <span className="hidden sm:inline">Nuevo producto</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {/* Buscador + filtros */}
      <CatalogoBuscador
        defaultQ={q}
        categorias={categorias.map((c: Categoria) => ({ nombre: c.nombre, slug: c.slug }))}
        currentCat={cat}
        currentFiltro={filtro}
      />

      {/* Resultados */}
      {(q || filtro || cat) && (
        <p className="text-sm text-gray-400 mb-3">
          {total} resultado{total !== 1 ? 's' : ''}
          {q && <> para <strong>&quot;{q}&quot;</strong></>}
          <Link href="/admin/catalogo" className="ml-2 text-red-500 hover:underline text-xs">Limpiar</Link>
        </p>
      )}

      <CatalogoAdminTable productos={productosPagina} />

      {/* Paginación — siempre visible */}
      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-400">
          {total === 0 ? 'Sin productos' : (
            <>Mostrando {(page - 1) * POR_PAGINA + 1}–{Math.min(page * POR_PAGINA, total)} de {total} · <span className="font-medium">{POR_PAGINA}/pág</span></>
          )}
        </p>

        {totalPaginas > 1 && (
          <div className="flex gap-2 flex-wrap">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors">
                ← Anterior
              </Link>
            )}
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPaginas || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <span key={p} className="flex items-center gap-2">
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="text-sm text-gray-400">…</span>}
                  <Link href={buildUrl({ page: String(p) })}
                    className="w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-xl transition-colors"
                    style={p === page
                      ? { backgroundColor: '#E11D2E', color: '#fff' }
                      : { border: '1px solid #E5E7EB', color: '#6B7280' }}>
                    {p}
                  </Link>
                </span>
              ))}
            {page < totalPaginas && (
              <Link href={buildUrl({ page: String(page + 1) })}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors">
                Siguiente →
              </Link>
            )}
          </div>
        )}
      </div>

      <Suspense>
        <AutoPageSize />
      </Suspense>
    </div>
  )
}
