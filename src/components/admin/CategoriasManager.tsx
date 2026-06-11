'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconGripVertical } from '@tabler/icons-react'
import { upsertCategoria, deleteCategoria } from '@/lib/actions/admin'
import { Switch } from '@/components/ui/Switch'

interface Categoria {
  id: string
  nombre: string
  slug: string
  orden: number
  activa: boolean
}

interface Props {
  categorias: Categoria[]
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function CategoriasManager({ categorias: inicial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editOrden, setEditOrden] = useState(0)
  const [showNew, setShowNew] = useState(false)
  const [newNombre, setNewNombre] = useState('')
  const [newOrden, setNewOrden] = useState(inicial.length + 1)

  function startEdit(cat: Categoria) {
    setEditingId(cat.id)
    setEditNombre(cat.nombre)
    setEditOrden(cat.orden)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditNombre('')
  }

  function handleSaveEdit(cat: Categoria) {
    startTransition(async () => {
      await upsertCategoria({ id: cat.id, nombre: editNombre, slug: slugify(editNombre), orden: editOrden, activa: cat.activa })
      setEditingId(null)
      router.refresh()
    })
  }

  function handleToggleActiva(cat: Categoria) {
    startTransition(async () => {
      await upsertCategoria({ ...cat, activa: !cat.activa })
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta categoría? Los productos quedarán sin categoría.')) return
    startTransition(async () => {
      await deleteCategoria(id)
      router.refresh()
    })
  }

  function handleCreate() {
    if (!newNombre.trim()) return
    startTransition(async () => {
      await upsertCategoria({ nombre: newNombre.trim(), slug: slugify(newNombre.trim()), orden: newOrden, activa: true })
      setNewNombre('')
      setShowNew(false)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Tabla de categorías */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[32px_1fr_80px_80px_80px] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <div />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nombre</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Orden</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Activa</p>
          <div />
        </div>

        {inicial.length === 0 && !showNew && (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-sm mb-1">Sin categorías</p>
            <p className="text-gray-300 text-xs">Crea la primera categoría</p>
          </div>
        )}

        {inicial.map((cat) => (
          <div key={cat.id}
            className="grid grid-cols-[32px_1fr_80px_80px_80px] gap-3 items-center px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group"
            style={{ opacity: cat.activa ? 1 : 0.5 }}>

            {editingId === cat.id ? (
              <div className="col-span-5 flex items-center gap-2">
                <div className="flex-1">
                  <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full border border-red-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-100 bg-white"
                    autoFocus placeholder="Nombre de la categoría" />
                </div>
                <div className="w-20">
                  <input type="number" value={editOrden} onChange={(e) => setEditOrden(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm text-gray-900 outline-none focus:border-red-300 text-center bg-white" />
                </div>
                <button onClick={() => handleSaveEdit(cat)} disabled={isPending}
                  className="w-9 h-9 flex items-center justify-center text-green-500 hover:bg-green-50 rounded-xl transition-colors disabled:opacity-40">
                  <IconCheck size={16} />
                </button>
                <button onClick={cancelEdit}
                  className="w-9 h-9 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                  <IconX size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center text-gray-200 group-hover:text-gray-400 transition-colors">
                  <IconGripVertical size={14} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-800">{cat.nombre}</p>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">{cat.slug}</p>
                </div>

                <div className="flex justify-center">
                  <span className="text-sm text-gray-400 font-mono">{cat.orden}</span>
                </div>

                <div className="flex justify-center">
                  <Switch checked={cat.activa} onChange={() => handleToggleActiva(cat)} disabled={isPending} size="sm" />
                </div>

                <div className="flex items-center justify-end gap-0.5">
                  <button onClick={() => startEdit(cat)}
                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <IconEdit size={14} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} disabled={isPending}
                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <IconTrash size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Fila nueva */}
        {showNew && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-t border-red-100">
            <div className="w-6" />
            <input value={newNombre} onChange={(e) => setNewNombre(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="flex-1 border border-red-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-100 bg-white"
              placeholder="Nombre de la categoría (ej: Botas)" autoFocus />
            <input type="number" value={newOrden} onChange={(e) => setNewOrden(Number(e.target.value))}
              className="w-16 border border-red-200 rounded-xl px-2 py-2 text-sm text-gray-900 outline-none text-center bg-white" />
            <button onClick={handleCreate} disabled={isPending || !newNombre.trim()}
              className="w-9 h-9 flex items-center justify-center text-green-500 hover:bg-green-50 rounded-xl transition-colors disabled:opacity-40">
              <IconCheck size={16} />
            </button>
            <button onClick={() => setShowNew(false)}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
              <IconX size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Botón nueva categoría */}
      {!showNew && (
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-full self-start transition-opacity hover:opacity-90 shadow-sm"
          style={{ backgroundColor: '#E11D2E', boxShadow: '0 2px 12px rgba(225,29,46,0.25)' }}>
          <IconPlus size={15} />
          Nueva categoría
        </button>
      )}
    </div>
  )
}
