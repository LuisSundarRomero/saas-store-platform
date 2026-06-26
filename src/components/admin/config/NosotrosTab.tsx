'use client'

import { useState } from 'react'
import Image from 'next/image'
import { IconUpload } from '@tabler/icons-react'
import { guardarConfigNosotros } from '@/lib/actions/admin'
import { useConfigTab } from '@/hooks/useConfigTab'
import { useImageUpload } from '@/hooks/useImageUpload'
import { Field, FieldArea, SaveSection, INPUT_CLS, VisibilityToggle } from './shared'
import type { ConfigNosotros } from '@/types'

interface Props {
  nosotros: ConfigNosotros | null
}

export function NosotrosTab({ nosotros }: Props) {
  const { isPending, saved, error, save } = useConfigTab()
  const { uploading, progress, error: uploadError, upload } = useImageUpload('productos', 'nosotros-')

  const [visible, setVisible]         = useState(nosotros?.visible       ?? false)
  const [titulo, setTitulo]           = useState(nosotros?.titulo        ?? 'Sobre nosotros')
  const [subtitulo, setSubtitulo]     = useState(nosotros?.subtitulo     ?? '')
  const [descripcion, setDescripcion] = useState(nosotros?.descripcion   ?? '')
  const [imagenUrl, setImagenUrl]     = useState(nosotros?.imagen_url    ?? '')

  function handleSave() {
    save(() =>
      guardarConfigNosotros({
        visible,
        titulo,
        subtitulo,
        descripcion,
        imagen_url: imagenUrl.trim() || null,
      })
    )
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    const urls = await upload(e.target.files, 0, 1)
    if (urls[0]) setImagenUrl(urls[0])
    e.target.value = ''
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <VisibilityToggle
          label="Mostrar sección Nosotros"
          description={visible ? 'La sección aparece en la página de inicio' : 'La sección está oculta'}
          checked={visible}
          onChange={setVisible}
        />

        <div style={{ opacity: visible ? 1 : 0.4, pointerEvents: visible ? 'auto' : 'none' }} className="flex flex-col gap-4">

          {/* Textos principales */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-800">Contenido</p>
            <Field label="Título" value={titulo} onChange={setTitulo} placeholder="Sobre nosotros" />
            <Field label="Subtítulo" value={subtitulo} onChange={setSubtitulo} placeholder="Nuestra historia y misión" />
            <FieldArea label="Descripción" value={descripcion} onChange={setDescripcion} placeholder="Cuéntale a tus clientes quiénes son, qué los inspira y por qué deberían elegirlos..." />
          </div>

          {/* Imagen */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-800">Imagen <span className="text-xs text-gray-400 font-normal">(opcional)</span></p>
            <div className="flex items-center gap-3">
              {imagenUrl ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                  <Image src={imagenUrl} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagenUrl('')}
                    className="absolute top-0 right-0 w-5 h-5 bg-gray-800 text-white rounded-bl-lg text-[10px] flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors shrink-0 ${uploading ? 'border-gray-100 opacity-50' : 'border-gray-200 cursor-pointer hover:border-red-300'}`}>
                  <IconUpload size={18} className="text-gray-300" />
                  {uploading && <span className="text-[8px] text-gray-400 mt-1 text-center px-1">{progress}</span>}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={imagenUrl}
                  onChange={(e) => setImagenUrl(e.target.value)}
                  className={INPUT_CLS}
                  placeholder="https://... o sube una imagen"
                />
                {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
              </div>
            </div>
          </div>
        </div>

        <SaveSection isPending={isPending} saved={saved} error={error} onSave={handleSave} />
      </div>

      {/* Preview */}
      <div className="hidden lg:flex bg-white rounded-2xl border border-gray-100 p-5 flex-col gap-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vista previa</p>

        {!visible && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            La sección está <strong>oculta</strong>. Actívala para que aparezca en la tienda.
          </p>
        )}

        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface-alt)', opacity: visible ? 1 : 0.4 }}
        >
          <div className={imagenUrl ? 'grid grid-cols-2' : 'p-5 flex flex-col gap-3'}>

            {imagenUrl && (
              <div className="relative aspect-square">
                <Image src={imagenUrl} alt="" fill className="object-cover" />
              </div>
            )}

            <div className="flex flex-col gap-2 p-4 justify-center">
              {subtitulo && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-px shrink-0" style={{ backgroundColor: 'var(--color-brand)' }} />
                  <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand)' }}>
                    {subtitulo}
                  </p>
                </div>
              )}
              <p className="font-display text-sm font-bold leading-tight" style={{ color: 'var(--color-ink)' }}>
                {titulo || 'Título'}
              </p>
              <div className="w-6 h-px" style={{ backgroundColor: 'var(--color-brand)', opacity: 0.3 }} />
              <p className="text-[9px] leading-relaxed line-clamp-5" style={{ color: 'var(--color-muted)' }}>
                {descripcion || 'Tu descripción aparecerá aquí...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
