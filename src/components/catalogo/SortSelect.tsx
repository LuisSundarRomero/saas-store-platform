'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sort = searchParams.get('sort') ?? 'nuevo'

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/catalogo?${params.toString()}`)
  }

  return (
    <select
      value={sort}
      onChange={(e) => handleChange(e.target.value)}
      className="text-sm border border-[var(--color-border)] rounded-full px-3 py-1.5 outline-none bg-[var(--color-surface)] text-[var(--color-muted)] cursor-pointer hover:border-[var(--color-brand)] transition-colors"
    >
      <option value="nuevo">Más recientes</option>
      <option value="precio_asc">Precio: menor a mayor</option>
      <option value="precio_desc">Precio: mayor a menor</option>
    </select>
  )
}

