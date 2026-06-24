'use client'

import { useState } from 'react'
import { guardarConfigAnuncio } from '@/lib/actions/admin'
import { useConfigTab } from '@/hooks/useConfigTab'
import { Field, SaveSection, INPUT_CLS, VisibilityToggle } from './shared'
import type { ConfigAnuncio } from '@/types'

interface Props {
  anuncio: ConfigAnuncio | null
}

export function AnuncioTab({ anuncio }: Props) {
  const { isPending, saved, error, save } = useConfigTab()
  const [now] = useState(() => Date.now())

  const [visible, setVisible] = useState(anuncio?.visible ?? false)
  const [texto, setTexto] = useState(anuncio?.texto ?? '')
  const [link, setLink] = useState(anuncio?.link ?? '')
  const [expira, setExpira] = useState(
    anuncio?.expira ? new Date(anuncio.expira).toISOString().slice(0, 16) : ''
  )

  function handleSave() {
    save(() =>
      guardarConfigAnuncio({
        visible,
        texto,
        link: link.trim() || null,
        expira: expira ? new Date(expira).toISOString() : null,
      })
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <VisibilityToggle
          label="Mostrar barra de anuncio"
          description={visible ? 'Visible en la parte superior del sitio' : 'Anuncio desactivado'}
          checked={visible}
          onChange={setVisible}
        />

        <div className={`flex flex-col gap-4 ${!visible ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-800">Mensaje del anuncio</p>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={3}
              className={`${INPUT_CLS} resize-none`}
              placeholder="🎀 Nuevo restock disponible — Stock limitado"
            />
            <Field label="Enlace al hacer clic (opcional)" value={link} onChange={setLink} placeholder="/catalogo" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-800">Vigencia</p>
            <input
              type="datetime-local"
              value={expira}
              onChange={(e) => setExpira(e.target.value)}
              className={INPUT_CLS}
            />
            {expira &&
              (() => {
                const diff = new Date(expira).getTime() - now
                if (diff <= 0)
                  return (
                    <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                      ⚠️ Esta fecha ya pasó
                    </p>
                  )
                const h = Math.floor(diff / 3600000)
                const d = Math.floor(h / 24)
                return (
                  <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    ✅ Se mostrará {d > 0 ? `${d}d ${h % 24}h` : `${h}h`} más
                  </p>
                )
              })()}
            <div className="flex flex-wrap gap-2">
              {[
                { label: '6h', h: 6 },
                { label: '12h', h: 12 },
                { label: '24h', h: 24 },
                { label: '48h', h: 48 },
                { label: '1 semana', h: 168 },
              ].map(({ label, h }) => (
                <button
                  key={h}
                  type="button"
                  onClick={() =>
                    setExpira(new Date(Date.now() + h * 3600000).toISOString().slice(0, 16))
                  }
                  className="px-3 py-1.5 rounded-full text-xs border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SaveSection isPending={isPending} saved={saved} error={error} onSave={handleSave} />
      </div>

      {/* Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Vista previa</p>
        {visible && texto ? (
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 text-white text-sm font-medium rounded-xl"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            <span className="text-center flex-1 text-xs">{texto}</span>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">Sin anuncio activo</p>
          </div>
        )}
      </div>
    </div>
  )
}
