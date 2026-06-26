'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/Switch'
import { guardarConfigBanner } from '@/lib/actions/admin'

interface Props {
  enabled: boolean
}

export function CategoriasSidebarToggle({ enabled }: Props) {
  const [active, setActive] = useState(enabled)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleToggle(value: boolean) {
    setActive(value)
    setSaved(false)
    startTransition(async () => {
      await guardarConfigBanner({ categorias_sidebar: value })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Sidebar de categorías</p>
          <p className="text-xs text-gray-400 mt-0.5">
            En desktop, muestra las categorías como panel lateral en lugar de chips horizontales.
            Se activa automáticamente cuando hay más de 9 categorías.
          </p>
        </div>
        <Switch checked={active} onChange={handleToggle} disabled={isPending} size="sm" />
      </div>

      {saved && (
        <p className="text-xs text-green-600 font-medium">Guardado correctamente</p>
      )}

      {/* Preview */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Vista previa desktop</p>
        </div>
        <div className="p-3 flex gap-3">
          {active ? (
            <>
              {/* Sidebar preview */}
              <div className="flex flex-col gap-1 w-20 shrink-0">
                <div className="h-2 w-14 rounded bg-gray-200 mb-1" />
                <div className="h-5 w-full rounded-md" style={{ backgroundColor: 'var(--color-brand, #e11d2e)', opacity: 0.8 }} />
                <div className="h-5 w-full rounded-md bg-gray-100" />
                <div className="h-5 w-full rounded-md bg-gray-100" />
                <div className="h-5 w-full rounded-md bg-gray-100" />
              </div>
              {/* Grid preview */}
              <div className="flex-1 grid grid-cols-3 gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-lg bg-gray-100" />
                ))}
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col gap-2">
              <div className="flex gap-1.5 overflow-hidden">
                <div className="h-5 w-10 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-brand, #e11d2e)', opacity: 0.8 }} />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-5 w-12 rounded-full shrink-0 bg-gray-100" />
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-lg bg-gray-100" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
