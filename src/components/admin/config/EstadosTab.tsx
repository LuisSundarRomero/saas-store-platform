'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconGripVertical, IconLock } from '@tabler/icons-react'
import {
  crearEstadoPedido,
  actualizarEstadoPedido,
  eliminarEstadoPedido,
  toggleVisibleEstadoPedido,
  reordenarEstadosPedido,
} from '@/lib/actions/admin'
import { Switch } from '@/components/ui/Switch'
import type { EstadoPedidoConfig } from '@/types'

const EMOJIS = ['⏳', '💳', '📦', '🚚', '✅', '🔍', '⚠️', '❌', '🎁', '📍']
const COLORES = [
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#FEE2E2', text: '#991B1B' },
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#EDE9FE', text: '#5B21B6' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#F3F4F6', text: '#374151' },
]

interface FormState {
  label: string
  emoji: string
  color_bg: string
  color_text: string
  requiere_comprobante: boolean
  notificar_whatsapp: boolean
  mensaje_whatsapp: string
}

const EMPTY_FORM: FormState = {
  label: '', emoji: '📦', color_bg: COLORES[5].bg, color_text: COLORES[5].text,
  requiere_comprobante: false, notificar_whatsapp: true, mensaje_whatsapp: '',
}

interface Props { estados: EstadoPedidoConfig[] }

export function EstadosTab({ estados: inicial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [estados, setEstados] = useState(inicial)
  const [prevInicial, setPrevInicial] = useState(inicial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [showNew, setShowNew] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [error, setError] = useState('')

  if (inicial !== prevInicial) {
    setPrevInicial(inicial)
    setEstados(inicial)
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null); setOverIndex(null); return
    }
    const next = [...estados]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(targetIndex, 0, moved)
    setEstados(next)
    setDragIndex(null); setOverIndex(null)
    startTransition(async () => {
      await reordenarEstadosPedido(next.map((e) => e.id))
      router.refresh()
    })
  }

  function startEdit(e: EstadoPedidoConfig) {
    setError('')
    setEditingId(e.id)
    setForm({
      label: e.label, emoji: e.emoji, color_bg: e.color_bg, color_text: e.color_text,
      requiere_comprobante: e.requiere_comprobante, notificar_whatsapp: e.notificar_whatsapp,
      mensaje_whatsapp: e.mensaje_whatsapp,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setShowNew(false)
    setForm(EMPTY_FORM)
    setError('')
  }

  function handleSaveEdit() {
    if (!editingId || !form.label.trim()) return
    startTransition(async () => {
      try {
        await actualizarEstadoPedido(editingId, form)
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
        await crearEstadoPedido({ ...form, orden: estados.length + 1 })
        cancelEdit()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear')
      }
    })
  }

  function handleToggleVisible(e: EstadoPedidoConfig) {
    startTransition(async () => {
      await toggleVisibleEstadoPedido(e.id, !e.visible)
      router.refresh()
    })
  }

  function handleDelete(e: EstadoPedidoConfig) {
    if (!confirm(`¿Eliminar el estado "${e.label}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      try {
        await eliminarEstadoPedido(e.id)
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
            placeholder="Nombre del estado (ej: En revisión)"
            autoFocus
            className="flex-1 border border-red-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-100 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {EMOJIS.map((em) => (
              <button key={em} type="button" onClick={() => setForm((f) => ({ ...f, emoji: em }))}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-base transition-colors"
                style={{ backgroundColor: form.emoji === em ? '#FECACA' : '#fff', border: '1px solid #FCA5A5' }}>
                {em}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {COLORES.map((c) => (
              <button key={c.bg} type="button"
                onClick={() => setForm((f) => ({ ...f, color_bg: c.bg, color_text: c.text }))}
                className="w-7 h-7 rounded-full transition-transform"
                style={{
                  backgroundColor: c.bg,
                  border: form.color_bg === c.bg ? `2px solid ${c.text}` : '2px solid transparent',
                  transform: form.color_bg === c.bg ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        <textarea
          value={form.mensaje_whatsapp}
          onChange={(e) => setForm((f) => ({ ...f, mensaje_whatsapp: e.target.value }))}
          placeholder="Mensaje que recibe el cliente por WhatsApp al llegar a este estado"
          rows={2}
          className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-300 bg-white resize-none"
        />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <Switch checked={form.requiere_comprobante} onChange={(v) => setForm((f) => ({ ...f, requiere_comprobante: v }))} size="sm" />
            Pide comprobante de pago
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <Switch checked={form.notificar_whatsapp} onChange={(v) => setForm((f) => ({ ...f, notificar_whatsapp: v }))} size="sm" />
            Notificar por WhatsApp
          </label>
        </div>

        <div className="flex items-center gap-2 self-end">
          <button onClick={onSave} disabled={isPending || !form.label.trim()}
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
        Define los estados por los que pasa un pedido. Los marcados con <IconLock size={11} className="inline -mt-0.5" /> son del sistema y no se pueden eliminar, pero sí renombrar.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {estados.map((e, i) => (
          <div key={e.id}>
            <div
              draggable={editingId === null && !showNew}
              onDragStart={() => setDragIndex(i)}
              onDragOver={(ev) => { ev.preventDefault(); setOverIndex(i) }}
              onDragLeave={() => setOverIndex((p) => (p === i ? null : p))}
              onDrop={(ev) => { ev.preventDefault(); handleDrop(i) }}
              onDragEnd={() => { setDragIndex(null); setOverIndex(null) }}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group"
              style={{
                opacity: e.visible ? (dragIndex === i ? 0.4 : 1) : 0.5,
                backgroundColor: overIndex === i && dragIndex !== null && dragIndex !== i ? '#FEF2F2' : undefined,
              }}
            >
              <div className="text-gray-300 group-hover:text-gray-500 transition-colors cursor-grab active:cursor-grabbing">
                <IconGripVertical size={14} />
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                style={{ backgroundColor: e.color_bg, color: e.color_text }}>
                {e.emoji} {e.label}
              </span>

              {e.es_sistema && <IconLock size={12} className="text-gray-300" />}

              <div className="flex-1" />

              <Switch checked={e.visible} onChange={() => handleToggleVisible(e)} disabled={isPending} size="sm" />

              <div className="flex items-center gap-0.5">
                <button onClick={() => startEdit(e)}
                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <IconEdit size={14} />
                </button>
                <button onClick={() => handleDelete(e)} disabled={isPending || e.es_sistema}
                  title={e.es_sistema ? 'Estado del sistema, no se puede eliminar' : 'Eliminar'}
                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed">
                  <IconTrash size={14} />
                </button>
              </div>
            </div>
            {editingId === e.id && renderForm(handleSaveEdit)}
          </div>
        ))}

        {estados.length === 0 && !showNew && (
          <div className="py-12 text-center">
            <p className="text-gray-400 text-sm">Sin estados configurados</p>
          </div>
        )}

        {showNew && renderForm(handleCreate)}
      </div>

      {!showNew && editingId === null && (
        <button onClick={() => { setShowNew(true); setForm(EMPTY_FORM) }}
          className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-full self-start transition-opacity hover:opacity-90 shadow-sm"
          style={{ backgroundColor: 'var(--color-brand)', boxShadow: '0 2px 12px rgba(225,29,46,0.25)' }}>
          <IconPlus size={15} />
          Nuevo estado
        </button>
      )}
    </div>
  )
}
