'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconGripVertical } from '@tabler/icons-react'
import {
  crearCampoCheckout,
  actualizarCampoCheckout,
  eliminarCampoCheckout,
  toggleActivoCampoCheckout,
  reordenarCamposCheckout,
} from '@/lib/actions/campos-checkout'
import { Switch } from '@/components/ui/Switch'
import type { CampoCheckoutConfig, CampoCheckoutTipo } from '@/types'

interface FormState {
  label: string
  tipo: CampoCheckoutTipo
  placeholder: string
  opciones: string[]
  requerido: boolean
}

const EMPTY_FORM: FormState = { label: '', tipo: 'texto', placeholder: '', opciones: [], requerido: true }

interface Props { campos: CampoCheckoutConfig[] }

export function CamposCheckoutManager({ campos: inicial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [campos, setCampos] = useState(inicial)
  const [prevInicial, setPrevInicial] = useState(inicial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [nuevaOpcion, setNuevaOpcion] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [error, setError] = useState('')

  if (inicial !== prevInicial) {
    setPrevInicial(inicial)
    setCampos(inicial)
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null); setOverIndex(null); return
    }
    const next = [...campos]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(targetIndex, 0, moved)
    setCampos(next)
    setDragIndex(null); setOverIndex(null)
    startTransition(async () => {
      await reordenarCamposCheckout(next.map((c) => c.id))
      router.refresh()
    })
  }

  function startEdit(c: CampoCheckoutConfig) {
    setError('')
    setEditingId(c.id)
    setForm({ label: c.label, tipo: c.tipo, placeholder: c.placeholder, opciones: c.opciones, requerido: c.requerido })
    setNuevaOpcion('')
  }

  function cancelEdit() {
    setEditingId(null)
    setShowNew(false)
    setForm(EMPTY_FORM)
    setNuevaOpcion('')
    setError('')
  }

  function agregarOpcion() {
    const v = nuevaOpcion.trim()
    if (!v || form.opciones.includes(v)) return
    setForm((f) => ({ ...f, opciones: [...f.opciones, v] }))
    setNuevaOpcion('')
  }

  function quitarOpcion(op: string) {
    setForm((f) => ({ ...f, opciones: f.opciones.filter((o) => o !== op) }))
  }

  function handleSaveEdit() {
    if (!editingId || !form.label.trim()) return
    startTransition(async () => {
      try {
        await actualizarCampoCheckout(editingId, form)
        cancelEdit()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar')
      }
    })
  }

  function handleCreate() {
    if (!form.label.trim()) return
    startTransition(async () => {
      try {
        await crearCampoCheckout(form)
        cancelEdit()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear')
      }
    })
  }

  function handleToggleActivo(c: CampoCheckoutConfig) {
    startTransition(async () => {
      await toggleActivoCampoCheckout(c.id, !c.activo)
      router.refresh()
    })
  }

  function handleDelete(c: CampoCheckoutConfig) {
    if (!confirm(`¿Eliminar el campo "${c.label}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      try {
        await eliminarCampoCheckout(c.id)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar')
      }
    })
  }

  function renderForm(onSave: () => void) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-red-50 border-t border-red-100">
        {error && <p className="text-xs text-red-600 bg-red-100 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-2">
          <input
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="Nombre del campo (ej: DNI, Referencia)"
            autoFocus
            className="flex-1 border border-red-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-100 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5">
            {(['texto', 'select'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, tipo: t }))}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={
                  form.tipo === t
                    ? { backgroundColor: '#FECACA', color: '#991B1B', border: '1px solid #FCA5A5' }
                    : { backgroundColor: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }
                }>
                {t === 'texto' ? 'Texto libre' : 'Opciones (select)'}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <Switch checked={form.requerido} onChange={(v) => setForm((f) => ({ ...f, requerido: v }))} size="sm" />
            Obligatorio
          </label>
        </div>

        {form.tipo === 'texto' ? (
          <input
            value={form.placeholder}
            onChange={(e) => setForm((f) => ({ ...f, placeholder: e.target.value }))}
            placeholder="Placeholder del input (ej: Ej: 12345678)"
            className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-300 bg-white"
          />
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              {form.opciones.map((op) => (
                <span key={op} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                  {op}
                  <button type="button" onClick={() => quitarOpcion(op)} className="text-gray-400 hover:text-red-500">
                    <IconX size={12} />
                  </button>
                </span>
              ))}
              {form.opciones.length === 0 && (
                <span className="text-xs text-gray-400">Sin opciones aún — agrega al menos una</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={nuevaOpcion}
                onChange={(e) => setNuevaOpcion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarOpcion() } }}
                placeholder="Ej: Olva Courier, Shalom..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-300 bg-white"
              />
              <button type="button" onClick={agregarOpcion}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors">
                Agregar
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 self-end">
          <button onClick={onSave} disabled={isPending || !form.label.trim() || (form.tipo === 'select' && form.opciones.length === 0)}
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-brand)' }}>
            <IconCheck size={15} /> Guardar
          </button>
          <button onClick={cancelEdit}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
            <IconX size={15} /> Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      <p className="text-sm text-gray-500">
        Nombre, celular y productos siempre se piden. Estos campos son adicionales — puedes editarlos, desactivarlos o eliminarlos cuando quieras.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {campos.map((c, i) => (
          <div key={c.id}>
            <div
              draggable={editingId === null && !showNew}
              onDragStart={() => setDragIndex(i)}
              onDragOver={(ev) => { ev.preventDefault(); setOverIndex(i) }}
              onDragLeave={() => setOverIndex((p) => (p === i ? null : p))}
              onDrop={(ev) => { ev.preventDefault(); handleDrop(i) }}
              onDragEnd={() => { setDragIndex(null); setOverIndex(null) }}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group"
              style={{
                opacity: c.activo ? (dragIndex === i ? 0.4 : 1) : 0.5,
                backgroundColor: overIndex === i && dragIndex !== null && dragIndex !== i ? '#FEF2F2' : undefined,
              }}
            >
              <div className="text-gray-300 group-hover:text-gray-500 transition-colors cursor-grab active:cursor-grabbing">
                <IconGripVertical size={14} />
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">{c.label}</span>
                <span className="text-[11px] text-gray-400">
                  {c.tipo === 'select' ? `Opciones: ${c.opciones.join(', ') || 'sin opciones'}` : 'Texto libre'}
                  {c.requerido ? ' · Obligatorio' : ' · Opcional'}
                </span>
              </div>

              <div className="flex-1" />

              <Switch checked={c.activo} onChange={() => handleToggleActivo(c)} disabled={isPending} size="sm" />

              <div className="flex items-center gap-0.5">
                <button onClick={() => startEdit(c)}
                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <IconEdit size={14} />
                </button>
                <button onClick={() => handleDelete(c)} disabled={isPending}
                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <IconTrash size={14} />
                </button>
              </div>
            </div>
            {editingId === c.id && renderForm(handleSaveEdit)}
          </div>
        ))}

        {campos.length === 0 && !showNew && (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-sm">Sin campos configurados</p>
          </div>
        )}

        {showNew && renderForm(handleCreate)}
      </div>

      {!showNew && editingId === null && (
        <button onClick={() => { setShowNew(true); setForm(EMPTY_FORM) }}
          className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-full self-start transition-opacity hover:opacity-90 shadow-sm"
          style={{ backgroundColor: 'var(--color-brand)', boxShadow: '0 2px 12px rgba(225,29,46,0.25)' }}>
          <IconPlus size={15} />
          Nuevo campo
        </button>
      )}
    </div>
  )
}
