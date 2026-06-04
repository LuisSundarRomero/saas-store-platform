'use client'

import { IconClock, IconPackage, IconTruck, IconCircleCheck } from '@tabler/icons-react'
import { EstadoPedido } from '@/types'

const ESTADOS: { key: EstadoPedido; label: string; icon: React.ReactNode }[] = [
  { key: 'pendiente',    label: 'Pendiente',    icon: <IconClock size={18} /> },
  { key: 'empaquetado',  label: 'Empaquetado',  icon: <IconPackage size={18} /> },
  { key: 'en_camino',    label: 'En camino',    icon: <IconTruck size={18} /> },
  { key: 'entregado',    label: 'Entregado',    icon: <IconCircleCheck size={18} /> },
]

const ORDER: EstadoPedido[] = ['pendiente', 'empaquetado', 'en_camino', 'entregado']

interface Props {
  estadoActual: EstadoPedido
}

export function OrderTimeline({ estadoActual }: Props) {
  const indexActual = ORDER.indexOf(estadoActual)

  return (
    <div className="flex flex-col gap-0">
      {ESTADOS.map((e, i) => {
        const completado = i < indexActual
        const activo = i === indexActual
        const futuro = i > indexActual

        return (
          <div key={e.key} className="flex items-start gap-3">
            {/* Dot + línea */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  completado
                    ? 'bg-[--color-success-bg] text-[--color-success]'
                    : activo
                    ? 'bg-[--color-brand] text-white'
                    : 'bg-[--color-surface] text-[--color-border]'
                }`}
              >
                {e.icon}
              </div>
              {i < ESTADOS.length - 1 && (
                <div
                  className={`w-0.5 h-8 ${
                    completado ? 'bg-[--color-success]' : 'bg-[--color-border]'
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <div className="pt-2 pb-8">
              <p
                className={`text-sm font-semibold ${
                  futuro ? 'text-[--color-text-secondary] opacity-40' : 'text-[--color-text]'
                } ${activo ? 'text-[--color-brand]' : ''}`}
              >
                {e.label}
              </p>
              {activo && (
                <p className="text-xs text-[--color-text-secondary] mt-0.5">Estado actual</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
