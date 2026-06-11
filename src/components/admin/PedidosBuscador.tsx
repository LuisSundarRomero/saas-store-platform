'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { IconSearch, IconX } from '@tabler/icons-react'

interface Props {
  defaultValue?: string
  estado?: string
}

export function PedidosBuscador({ defaultValue = '', estado }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (estado && estado !== 'todos') params.set('estado', estado)
    if (value.trim()) params.set('q', value.trim())
    params.set('page', '1')
    router.push(`/admin/pedidos?${params.toString()}`)
  }

  function handleClear() {
    setValue('')
    const params = new URLSearchParams()
    if (estado && estado !== 'todos') params.set('estado', estado)
    router.push(`/admin/pedidos?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <div className="relative">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar por código ORD-001..."
          className="pl-8 pr-8 py-2 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl outline-none focus:border-red-400 w-56 transition-colors bg-white"
        />
        {value && (
          <button type="button" onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <IconX size={14} />
          </button>
        )}
      </div>
      <button type="submit"
        className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#E11D2E' }}>
        Buscar
      </button>
    </form>
  )
}
