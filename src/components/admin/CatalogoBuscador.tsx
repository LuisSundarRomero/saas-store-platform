'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { IconSearch, IconX } from '@tabler/icons-react'

interface Props {
  defaultQ?: string
  categorias: { nombre: string; slug: string }[]
  currentCat?: string
  currentFiltro?: string
}

const FILTROS = [
  { value: '', label: 'Todos' },
  { value: 'visible', label: 'Visibles' },
  { value: 'oculto', label: 'Ocultos' },
  { value: 'destacado', label: 'Destacados' },
  { value: 'nuevo', label: 'Nuevos' },
  { value: 'agotado', label: 'Agotados' },
]

export function CatalogoBuscador({ defaultQ = '', categorias, currentCat, currentFiltro }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(defaultQ)

  function buildUrl(params: Record<string, string>) {
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    if (currentCat) p.set('cat', currentCat)
    if (currentFiltro) p.set('filtro', currentFiltro)
    Object.entries(params).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k))
    p.set('page', '1')
    return `/admin/catalogo?${p.toString()}`
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(buildUrl({ q: q.trim() }))
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Buscador */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative">
          <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto..."
            className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-pink-400 w-48 transition-colors" />
          {q && (
            <button type="button" onClick={() => { setQ(''); router.push(buildUrl({ q: '' })) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <IconX size={14} />
            </button>
          )}
        </div>
        <button type="submit"
          className="px-3 py-2 text-sm font-semibold text-white rounded-xl"
          style={{ backgroundColor: '#EC4899' }}>
          Buscar
        </button>
      </form>

      {/* Filtro por categoría */}
      <select value={currentCat ?? ''}
        onChange={(e) => router.push(buildUrl({ cat: e.target.value }))}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pink-400 bg-white text-gray-600">
        <option value="">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c.slug} value={c.slug}>{c.nombre}</option>
        ))}
      </select>

      {/* Filtros rápidos */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {FILTROS.map((f) => (
          <button key={f.value} type="button"
            onClick={() => router.push(buildUrl({ filtro: f.value }))}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={(currentFiltro ?? '') === f.value
              ? { backgroundColor: '#EC4899', color: '#fff' }
              : { backgroundColor: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' }}>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
