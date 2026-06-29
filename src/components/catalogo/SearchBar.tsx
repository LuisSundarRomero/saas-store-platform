'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { IconSearch, IconX } from '@tabler/icons-react'

export function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const q = params.get('q') ?? ''

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = inputRef.current?.value.trim() ?? ''
    const next = new URLSearchParams(params.toString())
    if (value) {
      next.set('q', value)
    } else {
      next.delete('q')
    }
    next.delete('page')
    startTransition(() => router.push(`${pathname}?${next.toString()}`))
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = ''
    const next = new URLSearchParams(params.toString())
    next.delete('q')
    next.delete('page')
    startTransition(() => router.push(`${pathname}?${next.toString()}`))
  }

  return (
    <form onSubmit={handleSubmit} role="search" aria-label="Buscar productos" className="relative flex items-center w-full max-w-xs">
      <IconSearch size={15} className="absolute left-3 pointer-events-none" style={{ color: 'var(--color-muted)' }} aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        defaultValue={q}
        placeholder="Buscar producto..."
        aria-label="Buscar productos"
        className="w-full pl-8 pr-8 py-2 text-sm rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-brand)] transition-colors"
      />
      {q && (
        <button type="button" onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute right-2.5 transition-colors" style={{ color: 'var(--color-muted)' }}>
          <IconX size={14} aria-hidden="true" />
        </button>
      )}
    </form>
  )
}

