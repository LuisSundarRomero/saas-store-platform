'use client'

import { IconClock, IconPackage, IconTruck, IconCircleCheck, IconCreditCard } from '@tabler/icons-react'
import { EstadoPedido } from '@/types'

const ESTADOS: { key: EstadoPedido; label: string; icon: React.ReactNode }[] = [
  { key: 'pendiente',       label: 'Pendiente',        icon: <IconClock size={16} /> },
  { key: 'pago_confirmado', label: 'Pago confirmado',  icon: <IconCreditCard size={16} /> },
  { key: 'empaquetado',     label: 'Empaquetado',      icon: <IconPackage size={16} /> },
  { key: 'en_camino',       label: 'En camino',        icon: <IconTruck size={16} /> },
  { key: 'entregado',       label: 'Entregado',        icon: <IconCircleCheck size={16} /> },
]

const ORDER: EstadoPedido[] = ['pendiente', 'pago_confirmado', 'empaquetado', 'en_camino', 'entregado']

interface HistorialEntry {
  estado: EstadoPedido
  changed_at: string
}

interface Props {
  estadoActual: EstadoPedido
  historial?: HistorialEntry[]
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function OrderTimeline({ estadoActual, historial }: Props) {
  const indexActual = ORDER.indexOf(estadoActual)
  const fechaMap: Partial<Record<EstadoPedido, string>> = {}
  historial?.forEach((h) => { fechaMap[h.estado] = h.changed_at })

  return (
    <div className="flex flex-col">
      {ESTADOS.map((e, i) => {
        const completado = i < indexActual
        const activo = i === indexActual
        const futuro = i > indexActual
        const fecha = fechaMap[e.key]
        const isLast = i === ESTADOS.length - 1

        return (
          <div key={e.key} className="flex gap-4">
            {/* Columna izquierda: dot + línea */}
            <div className="flex flex-col items-center" style={{ width: 36 }}>
              <div
                className="flex items-center justify-center rounded-full shrink-0 transition-all"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: completado
                    ? '#DCFCE7'
                    : activo
                    ? '#EC4899'
                    : '#F3F4F6',
                  color: completado
                    ? '#16A34A'
                    : activo
                    ? '#ffffff'
                    : '#D1D5DB',
                  boxShadow: activo ? '0 0 0 4px #FCE7F3' : 'none',
                }}
              >
                {e.icon}
              </div>
              {!isLast && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 24,
                    backgroundColor: completado ? '#86EFAC' : '#E5E7EB',
                  }}
                />
              )}
            </div>

            {/* Contenido */}
            <div className={`pb-6 ${isLast ? 'pb-0' : ''}`} style={{ paddingTop: 7 }}>
              <p
                className="text-sm font-semibold leading-tight"
                style={{
                  color: activo ? '#EC4899' : futuro ? '#D1D5DB' : '#111827',
                }}
              >
                {e.label}
              </p>
              {activo && !fecha && (
                <span
                  className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#FCE7F3', color: '#EC4899' }}
                >
                  Estado actual
                </span>
              )}
              {fecha && (
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                  {formatDateTime(fecha)}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
