'use client'

import { Fragment, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { IconChevronDown, IconChevronUp, IconCheck, IconMail, IconPhone } from '@tabler/icons-react'
import { EstadoReclamacion, Reclamacion } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { responderReclamo } from '@/lib/actions/reclamaciones'

const BADGE_ESTADO: Record<EstadoReclamacion, { bg: string; color: string; label: string }> = {
  pendiente: { bg: '#FEF3C7', color: '#92400E', label: 'Pendiente' },
  atendido:  { bg: '#D1FAE5', color: '#065F46', label: 'Atendido' },
}

const BADGE_TIPO: Record<string, { bg: string; color: string }> = {
  reclamo: { bg: '#FEE2E2', color: '#991B1B' },
  queja:   { bg: '#EDE9FE', color: '#5B21B6' },
}

interface Props { reclamaciones: Reclamacion[] }

export function ReclamacionesTable({ reclamaciones }: Props) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [respuesta, setRespuesta] = useState('')
  const [isPending, startTransition] = useTransition()

  function toggle(r: Reclamacion) {
    if (expandedId === r.id) {
      setExpandedId(null)
    } else {
      setExpandedId(r.id)
      setRespuesta(r.respuesta ?? '')
    }
  }

  function handleResponder(id: string) {
    if (!respuesta.trim()) return
    startTransition(async () => {
      await responderReclamo(id, respuesta.trim())
      router.refresh()
    })
  }

  if (reclamaciones.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="font-medium">No hay reclamaciones</p>
      </div>
    )
  }

  function Detalle({ r }: { r: Reclamacion }) {
    return (
      <div className="flex flex-col gap-3 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Consumidor</p>
            <p className="text-gray-800">{r.consumidor_nombre}</p>
            <p className="text-gray-500 text-xs">{r.consumidor_domicilio}</p>
            <p className="text-gray-500 text-xs">{r.consumidor_tipo_doc}: {r.consumidor_num_doc}</p>
            {r.tutor_nombre && <p className="text-gray-500 text-xs">Tutor: {r.tutor_nombre}</p>}
            <div className="flex flex-col gap-0.5 mt-1.5">
              <a href={`mailto:${r.consumidor_email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500">
                <IconMail size={12} /> {r.consumidor_email}
              </a>
              {r.consumidor_telefono && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <IconPhone size={12} /> {r.consumidor_telefono}
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bien contratado</p>
            <p className="text-gray-800 capitalize">{r.bien_tipo}</p>
            <p className="text-gray-500 text-xs">{r.bien_descripcion}</p>
            {r.monto_reclamado !== null && (
              <p className="text-gray-500 text-xs">Monto: {formatPrice(r.monto_reclamado)}</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Detalle ({r.tipo})</p>
          <p className="text-gray-700 whitespace-pre-wrap">{r.detalle}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Pedido del consumidor</p>
          <p className="text-gray-700 whitespace-pre-wrap">{r.pedido}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Respuesta del proveedor</p>
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all bg-white resize-none"
            placeholder="Escribe la respuesta y acciones tomadas para este reclamo..."
          />
          <button
            onClick={() => handleResponder(r.id)}
            disabled={isPending || !respuesta.trim()}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#E11D2E' }}
          >
            <IconCheck size={15} />
            {isPending ? 'Guardando...' : 'Guardar respuesta'}
          </button>
          {r.respondido_at && (
            <p className="text-xs text-gray-400 mt-1.5">Respondido el {formatDate(r.respondido_at)}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── MOBILE: tarjetas ── */}
      <div className="flex flex-col gap-3 lg:hidden">
        {reclamaciones.map((r) => {
          const badge = BADGE_ESTADO[r.estado]
          const tipoBadge = BADGE_TIPO[r.tipo]
          const open = expandedId === r.id
          return (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4"
              style={r.estado === 'pendiente' ? { borderLeft: '3px solid #E11D2E' } : {}}>
              <button onClick={() => toggle(r)} className="w-full text-left">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-bold text-base" style={{ color: '#E11D2E' }}>
                    #{String(r.numero).padStart(4, '0')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: tipoBadge.bg, color: tipoBadge.color }}>
                      {r.tipo}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{r.consumidor_nombre}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-gray-400">{formatDate(r.created_at)}</p>
                  {open ? <IconChevronUp size={16} className="text-gray-400" /> : <IconChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>
              {open && <div className="mt-3 pt-3 border-t border-gray-100"><Detalle r={r} /></div>}
            </div>
          )
        })}
      </div>

      {/* ── DESKTOP: tabla ── */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-400">N°</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-400">Consumidor</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-400">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-400">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-400">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reclamaciones.map((r) => {
                const badge = BADGE_ESTADO[r.estado]
                const tipoBadge = BADGE_TIPO[r.tipo]
                const open = expandedId === r.id
                return (
                  <Fragment key={r.id}>
                    <tr className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggle(r)}
                      style={r.estado === 'pendiente' ? { borderLeft: '2px solid #E11D2E' } : {}}>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#E11D2E' }}>#{String(r.numero).padStart(4, '0')}</td>
                      <td className="px-4 py-3 text-gray-700">{r.consumidor_nombre}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ backgroundColor: tipoBadge.bg, color: tipoBadge.color }}>
                          {r.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(r.created_at)}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 bg-gray-50">
                          <Detalle r={r} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
