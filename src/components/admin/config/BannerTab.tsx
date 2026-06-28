'use client'

import { useState } from 'react'
import Image from 'next/image'
import { IconUpload, IconGripVertical } from '@tabler/icons-react'
import { Switch } from '@/components/ui/Switch'
import { guardarConfigBanner } from '@/lib/actions/admin'
import { useConfigTab } from '@/hooks/useConfigTab'
import { useImageUpload } from '@/hooks/useImageUpload'
import { Field, FieldArea, SaveSection, INPUT_CLS, VisibilityToggle } from './shared'
import type { ConfigBanner } from '@/types'

const MAX_BANNER_IMAGES = 6

interface Props {
  banner: ConfigBanner | null
}

export function BannerTab({ banner }: Props) {
  const { isPending, saved, error, save } = useConfigTab()
  const { uploading, progress, error: uploadError, upload } = useImageUpload('productos', 'banner-')

  const [heroBadge, setHeroBadge] = useState(banner?.hero_badge ?? '')
  const [heroTitulo, setHeroTitulo] = useState(banner?.hero_titulo ?? '')
  const [heroSubtitulo, setHeroSubtitulo] = useState(banner?.hero_subtitulo ?? '')
  const [heroBoton, setHeroBoton] = useState(banner?.hero_boton ?? 'Ver colección →')
  const [heroVisible, setHeroVisible] = useState(banner?.hero_visible ?? true)
  const [imagenesVisible, setImagenesVisible] = useState(banner?.imagenes_visible ?? true)
  const [imagenes, setImagenes] = useState<string[]>(banner?.imagenes ?? [])
  const [links, setLinks] = useState<string[]>(banner?.imagenes_links ?? [])
  const [stripVisible, setStripVisible] = useState(banner?.strip_visible ?? true)
  const [stripItem1, setStripItem1] = useState(banner?.strip_item1 ?? '')
  const [stripItem2, setStripItem2] = useState(banner?.strip_item2 ?? '')
  const [stripItem3, setStripItem3] = useState(banner?.strip_item3 ?? '')
  const [stripItem4, setStripItem4] = useState(banner?.strip_item4 ?? '')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  function handleSave() {
    save(() =>
      guardarConfigBanner({
        hero_badge: heroBadge,
        hero_titulo: heroTitulo,
        hero_subtitulo: heroSubtitulo,
        hero_boton: heroBoton,
        hero_visible: heroVisible,
        imagenes_visible: imagenesVisible,
        imagenes,
        imagenes_links: links,
        strip_visible: stripVisible,
        strip_item1: stripItem1,
        strip_item2: stripItem2,
        strip_item3: stripItem3,
        strip_item4: stripItem4,
      })
    )
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    const urls = await upload(e.target.files, imagenes.length, MAX_BANNER_IMAGES)
    if (urls.length > 0) {
      const nuevasImagenes = [...imagenes, ...urls]
      const nuevosLinks = [...links, ...urls.map(() => '')]
      setImagenes(nuevasImagenes)
      setLinks(nuevosLinks)
      await guardarConfigBanner({ imagenes: nuevasImagenes, imagenes_links: nuevosLinks })
    }
    e.target.value = ''
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null)
      setOverIndex(null)
      return
    }
    setImagenes((prev) => {
      const n = [...prev]
      const [m] = n.splice(dragIndex, 1)
      n.splice(targetIndex, 0, m)
      return n
    })
    setLinks((prev) => {
      const n = [...prev]
      const [m] = n.splice(dragIndex, 1)
      n.splice(targetIndex, 0, m)
      return n
    })
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <VisibilityToggle
          label="Mostrar banner"
          description={heroVisible ? 'El banner es visible en la página de inicio' : 'El banner está oculto'}
          checked={heroVisible}
          onChange={setHeroVisible}
        />

        <div style={{ opacity: heroVisible ? 1 : 0.4, pointerEvents: heroVisible ? 'auto' : 'none' }} className="flex flex-col gap-4">
          <VisibilityToggle
            label="Mostrar slider de imágenes"
            description={imagenesVisible ? 'Se muestra el carrusel de imágenes del banner' : 'Solo texto, sin imágenes'}
            checked={imagenesVisible}
            onChange={setImagenesVisible}
          />

          {/* Imágenes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Imágenes del slider</p>
                <p className="text-xs text-gray-400 mt-0.5">Sube fotos promocionales o de campaña (máx. 6)</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                {imagenes.length}/6
              </span>
            </div>

            {imagenes.length === 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                Sin imágenes propias: se muestran los <strong>productos destacados</strong> del catálogo.
              </p>
            )}

            <div className="flex gap-2 flex-wrap">
              {imagenes.map((url, i) => (
                <div
                  key={url}
                  className="relative group"
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => { e.preventDefault(); setOverIndex(i) }}
                  onDragLeave={() => setOverIndex((p) => (p === i ? null : p))}
                  onDrop={(e) => { e.preventDefault(); handleDrop(i) }}
                  onDragEnd={() => { setDragIndex(null); setOverIndex(null) }}
                  style={{
                    opacity: dragIndex === i ? 0.4 : 1,
                    transform: overIndex === i && dragIndex !== null && dragIndex !== i ? 'scale(1.06)' : 'scale(1)',
                    transition: 'transform 0.1s, opacity 0.1s',
                  }}
                >
                  <div
                    className="relative w-16 h-16 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
                    style={{ border: i === 0 ? '2px solid var(--color-brand)' : '2px solid #E5E7EB' }}
                  >
                    <Image src={url} alt="" fill className="object-cover pointer-events-none" />
                    <span className="absolute bottom-0 right-0 bg-black/40 text-white rounded-tl-md p-0.5 leading-none">
                      <IconGripVertical size={10} />
                    </span>
                    {i === 0 && (
                      <span
                        className="absolute top-0 left-0 text-[8px] font-bold text-white px-1 rounded-br-md"
                        style={{ backgroundColor: 'var(--color-brand)' }}
                      >
                        1ª
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagenes((p) => p.filter((_, j) => j !== i))
                      setLinks((p) => p.filter((_, j) => j !== i))
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <input
                    type="text"
                    value={links[i] ?? ''}
                    onChange={(e) =>
                      setLinks((p) => { const n = [...p]; n[i] = e.target.value; return n })
                    }
                    placeholder="/catalogo"
                    className="mt-1 w-16 text-[10px] text-center border border-gray-200 rounded-md px-1 py-0.5 outline-none focus:border-red-400 bg-white text-gray-900"
                  />
                </div>
              ))}
              {imagenes.length < MAX_BANNER_IMAGES && (
                <label
                  className={`w-16 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${uploading ? 'border-gray-100 opacity-50' : 'border-gray-200 cursor-pointer hover:border-red-300'}`}
                >
                  <IconUpload size={16} className="text-gray-300" />
                  {uploading && (
                    <span className="text-[8px] text-gray-400 mt-0.5 text-center px-1">{progress}</span>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          </div>

          {/* Strip */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Barra de características</p>
              <Switch checked={stripVisible} onChange={setStripVisible} size="sm" />
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${!stripVisible ? 'opacity-40 pointer-events-none' : ''}`}>
              {(
                [
                  [stripItem1, setStripItem1, 'Ej: 🎀 Diseños únicos'],
                  [stripItem2, setStripItem2, 'Ej: ✨ Colección exclusiva'],
                  [stripItem3, setStripItem3, 'Ej: 💬 Atención personalizada'],
                  [stripItem4, setStripItem4, 'Ej: 🚚 Envíos a todo Lima'],
                ] as [string, (v: string) => void, string][]
              ).map(([val, setter, ph], i) => (
                <input key={i} value={val} onChange={(e) => setter(e.target.value)} className={INPUT_CLS} placeholder={ph} />
              ))}
            </div>
          </div>

          <Field label="Badge (etiqueta pequeña)" value={heroBadge} onChange={setHeroBadge} placeholder="🎀 Nueva colección disponible" />
          <Field label="Título principal" value={heroTitulo} onChange={setHeroTitulo} placeholder="Zapatos que te hacen brillar" />
          <FieldArea label="Subtítulo" value={heroSubtitulo} onChange={setHeroSubtitulo} placeholder="Descripción breve de tu tienda..." />
          <Field label="Texto del botón" value={heroBoton} onChange={setHeroBoton} placeholder="Ver colección →" />
        </div>

        <SaveSection isPending={isPending} saved={saved} error={error} onSave={handleSave} />
      </div>

      {/* Preview banner */}
      <div className="hidden lg:flex bg-white rounded-2xl border border-gray-100 p-5 flex-col gap-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vista previa</p>
        <div className="rounded-2xl overflow-hidden relative" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
          <div className={`flex gap-3 p-5 ${imagenesVisible ? '' : 'justify-center'}`}>
            <div className={`flex flex-col justify-center gap-2 ${imagenesVisible ? 'flex-1 min-w-0' : 'text-center max-w-[220px] items-center'}`}>
              <span
                className="inline-flex items-center gap-1.5 self-start text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full"
                style={{ backgroundColor: 'var(--color-brand-bg)', color: 'var(--color-brand-text)' }}
              >
                <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: 'var(--color-brand)' }} />
                {heroBadge || 'Badge'}
              </span>
              <p className="font-display text-base font-bold leading-tight" style={{ color: 'var(--color-ink)' }}>
                {(heroTitulo || 'Título').split(' ').map((word, i, arr) => (
                  <span key={i}>
                    <span style={{ color: i >= Math.floor(arr.length / 2) ? 'var(--color-brand)' : 'var(--color-ink)' }}>
                      {word}
                    </span>
                    {i < arr.length - 1 && ' '}
                  </span>
                ))}
              </p>
              <p className="text-[10px] leading-relaxed line-clamp-2" style={{ color: 'var(--color-muted)' }}>
                {heroSubtitulo}
              </p>
              <span
                className="self-start inline-block text-[10px] font-semibold text-white px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                {heroBoton || 'Botón'}
              </span>
            </div>
            {imagenesVisible && (
              <div
                className="relative shrink-0 rounded-xl flex items-center justify-center text-2xl"
                style={{ width: '55%', minHeight: 120, backgroundColor: 'var(--color-surface)' }}
              >
                📸
                <div className="absolute bottom-2 flex items-center gap-1">
                  {Array.from({ length: Math.min(imagenes.length || 3, 6) }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: i === 0 ? 'var(--color-brand)' : 'var(--color-border)' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {stripVisible && [stripItem1, stripItem2, stripItem3, stripItem4].some(Boolean) && (
          <div
            className="border rounded-xl py-2.5 px-3"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {[stripItem1, stripItem2, stripItem3, stripItem4].filter(Boolean).map((item, i) => (
                <span key={i} className="text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
