'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { IconBrandWhatsapp, IconCheck, IconMail, IconBuildingStore, IconPhoto, IconFileText, IconEye, IconEyeOff, IconSettings, IconSpeakerphone, IconUpload, IconGripVertical } from '@tabler/icons-react'
import { Switch } from '@/components/ui/Switch'

interface Props { config: any }

const TABS = [
  { id: 'tienda',   label: 'Tienda',    icon: IconBuildingStore },
  { id: 'anuncio',  label: 'Anuncio',   icon: IconSettings },
  { id: 'banner',   label: 'Banner',    icon: IconPhoto },
  { id: 'textos',   label: 'Textos',    icon: IconFileText },
  { id: 'mensajes', label: 'Mensajes',  icon: IconBrandWhatsapp },
]

function validarNumero(num: string) {
  return /^\d{10,15}$/.test(num.replace(/\s/g, ''))
}

export function ConfigForm({ config }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState('tienda')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Tienda
  const [tiendaNombre,      setTiendaNombre]      = useState(config?.tienda_nombre      ?? '')
  const [whatsappNumero,    setWhatsappNumero]    = useState(config?.whatsapp_numero    ?? '')
  const [moneda,            setMoneda]            = useState(config?.moneda             ?? 'PEN')
  const [emailNotif,        setEmailNotif]        = useState(config?.email_notificaciones ?? '')

  // Banner
  const [heroBadge,           setHeroBadge]           = useState(config?.hero_badge             ?? '🦇 Restock en preventa')
  const [heroTitulo,          setHeroTitulo]          = useState(config?.hero_titulo            ?? 'Hago lo que quiero vestir')
  const [heroSubtitulo,       setHeroSubtitulo]       = useState(config?.hero_subtitulo         ?? 'Lujo oscuro. Essence of Dark Fashion. Piezas streetwear de edición limitada.')
  const [heroBoton,           setHeroBoton]           = useState(config?.hero_boton             ?? 'Ver colección →')
  const [heroVisible,         setHeroVisible]         = useState(config?.hero_visible           ?? true)
  const [heroImagenesVisible, setHeroImagenesVisible] = useState(config?.hero_imagenes_visible  ?? true)
  const [bannerImagenes,      setBannerImagenes]      = useState<string[]>(config?.banner_imagenes ?? [])
  const [bannerUploading,     setBannerUploading]     = useState(false)
  const [bannerUploadProgress, setBannerUploadProgress] = useState('')
  const [bannerUploadError,   setBannerUploadError]   = useState('')
  const [bannerDragIndex,     setBannerDragIndex]     = useState<number | null>(null)
  const [bannerOverIndex,     setBannerOverIndex]     = useState<number | null>(null)

  // Textos
  const [ctaTitulo,       setCtaTitulo]       = useState(config?.cta_titulo        ?? '¿Tienes alguna consulta?')
  const [ctaSubtitulo,    setCtaSubtitulo]    = useState(config?.cta_subtitulo     ?? 'Te asesoramos personalmente para encontrar tu pieza.')
  const [ctaVisible,      setCtaVisible]      = useState(config?.cta_visible       ?? true)
  const [footerDesc,      setFooterDesc]      = useState(config?.footer_descripcion ?? 'Lujo oscuro / Essence of Dark Fashion. Piezas streetwear de edición limitada — hago lo que quiero vestir.')
  const [footerPolitica,  setFooterPolitica]  = useState(config?.footer_politica   ?? 'No hacemos cambios ni devoluciones 🦇')
  const [footerInfo1,     setFooterInfo1]     = useState(config?.footer_info1      ?? 'Preventas por tiempo limitado')
  const [footerInfo2,     setFooterInfo2]     = useState(config?.footer_info2      ?? 'Envíos a nivel nacional')
  const [footerInfo3,     setFooterInfo3]     = useState(config?.footer_info3      ?? '')
  const [footerInfo4,     setFooterInfo4]     = useState(config?.footer_info4      ?? '')
  // Anuncio
  const [anuncioVisible,  setAnuncioVisible]  = useState(config?.anuncio_visible   ?? false)
  const [anuncioTexto,    setAnuncioTexto]    = useState(config?.anuncio_texto     ?? '')
  const [anuncioLink,     setAnuncioLink]     = useState(config?.anuncio_link      ?? '')
  const [anuncioExpira,   setAnuncioExpira]   = useState(
    config?.anuncio_expira ? new Date(config.anuncio_expira).toISOString().slice(0, 16) : ''
  )
  const [stripVisible,    setStripVisible]    = useState(config?.strip_visible     ?? true)
  const [stripItem1,      setStripItem1]      = useState(config?.strip_item1       ?? '🖤 Diseños únicos y originales')
  const [stripItem2,      setStripItem2]      = useState(config?.strip_item2       ?? '🦇 Colección dark exclusiva')
  const [stripItem3,      setStripItem3]      = useState(config?.strip_item3       ?? '💬 Atención personalizada')
  const [stripItem4,      setStripItem4]      = useState(config?.strip_item4       ?? '🚚 Envíos a nivel nacional')

  // Mensajes
  const [template, setTemplate] = useState(config?.whatsapp_template ?? '')

  const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all bg-white"

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setBannerUploadError('')
    setBannerUploading(true)
    const supabase = createClient()
    const urls: string[] = []
    const disponibles = 6 - bannerImagenes.length
    const aSubir = Array.from(files).slice(0, disponibles)

    for (let i = 0; i < aSubir.length; i++) {
      const file = aSubir[i]
      setBannerUploadProgress(`Subiendo ${i + 1} de ${aSubir.length}...`)
      if (file.size > 5 * 1024 * 1024) {
        setBannerUploadError(`"${file.name}" supera los 5MB`)
        continue
      }
      const ext = file.name.split('.').pop()
      const path = `banner-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('productos').upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) {
        setBannerUploadError(`Error subiendo "${file.name}"`)
      } else {
        const { data } = supabase.storage.from('productos').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setBannerImagenes((prev) => [...prev, ...urls])
    setBannerUploading(false)
    setBannerUploadProgress('')
    e.target.value = ''
  }

  function handleBannerDrop(targetIndex: number) {
    if (bannerDragIndex === null || bannerDragIndex === targetIndex) {
      setBannerDragIndex(null)
      setBannerOverIndex(null)
      return
    }
    setBannerImagenes((prev) => {
      const next = [...prev]
      const [moved] = next.splice(bannerDragIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
    setBannerDragIndex(null)
    setBannerOverIndex(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const numero = whatsappNumero.replace(/\s/g, '')
    if (!validarNumero(numero)) {
      setError('El número WhatsApp debe tener entre 10 y 15 dígitos con código de país.')
      setTab('tienda')
      return
    }
    startTransition(async () => {
      const supabase = createClient()
      const data = {
        tienda_nombre: tiendaNombre,
        whatsapp_numero: numero,
        moneda,
        email_notificaciones: emailNotif.trim() || null,
        hero_badge: heroBadge,
        hero_titulo: heroTitulo,
        hero_subtitulo: heroSubtitulo,
        hero_boton: heroBoton,
        hero_visible: heroVisible,
        hero_imagenes_visible: heroImagenesVisible,
        banner_imagenes: bannerImagenes,
        cta_titulo: ctaTitulo,
        cta_subtitulo: ctaSubtitulo,
        cta_visible: ctaVisible,
        footer_descripcion: footerDesc,
        footer_politica: footerPolitica,
        footer_info1: footerInfo1,
        footer_info2: footerInfo2,
        footer_info3: footerInfo3,
        footer_info4: footerInfo4,
        anuncio_visible: anuncioVisible,
        anuncio_texto: anuncioTexto,
        anuncio_link: anuncioLink.trim() || null,
        anuncio_expira: anuncioExpira ? new Date(anuncioExpira).toISOString() : null,
        strip_visible: stripVisible,
        strip_item1: stripItem1,
        strip_item2: stripItem2,
        strip_item3: stripItem3,
        strip_item4: stripItem4,
        whatsapp_template: template,
      }
      const fn = config?.id
        ? supabase.from('config').update(data).eq('id', config.id)
        : supabase.from('config').insert(data)
      const { error: err } = await fn
      if (err) { setError(err.message); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-5 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
            style={tab === id
              ? { backgroundColor: '#fff', color: '#E11D2E', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
              : { color: '#9CA3AF' }}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: TIENDA ── */}
      {tab === 'tienda' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">

            {/* WhatsApp */}
            <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-3"
              style={{ borderColor: '#25D366' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
                  <IconBrandWhatsapp size={16} style={{ color: '#16A34A' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Número de WhatsApp</p>
                  <p className="text-xs text-gray-400">Aquí llegan los pedidos de tus clientes</p>
                </div>
                {validarNumero(whatsappNumero) && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                    <IconCheck size={11} /> Válido
                  </span>
                )}
              </div>
              <div className="flex items-center border-2 rounded-xl overflow-hidden"
                style={{ borderColor: validarNumero(whatsappNumero) ? '#25D366' : '#E5E7EB' }}>
                <span className="px-3 py-2.5 text-sm text-gray-400 font-mono border-r border-gray-100 bg-gray-50">+</span>
                <input type="tel" inputMode="numeric" value={whatsappNumero}
                  onChange={(e) => setWhatsappNumero(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none font-mono bg-white"
                  placeholder="51982121991" />
              </div>
              <p className="text-xs text-gray-400">Código de país + número. Perú: <strong>51</strong>XXXXXXXXX</p>
            </div>

            {/* Email */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                  <IconMail size={16} style={{ color: '#E11D2E' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Email de notificaciones</p>
                  <p className="text-xs text-gray-400">Te avisamos por cada pedido nuevo</p>
                </div>
              </div>
              <input type="email" value={emailNotif} onChange={(e) => setEmailNotif(e.target.value)}
                className={inputCls} placeholder="contacto@anarchyy.pe" />
              <p className="text-xs text-gray-400">Déjalo vacío para no recibir emails.</p>
            </div>
          </div>

          {/* Datos tienda */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <IconBuildingStore size={16} className="text-purple-500" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Datos de la tienda</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Nombre de la tienda</label>
              <input value={tiendaNombre} onChange={(e) => setTiendaNombre(e.target.value)}
                className={inputCls} placeholder="Anarchyy.pe" />
              <p className="text-xs text-gray-400 mt-1">Aparece en el navbar, footer y admin.</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Moneda</label>
              <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className={inputCls}>
                <option value="PEN">S/ — Sol peruano</option>
                <option value="USD">$ — Dólar</option>
                <option value="COP">$ — Peso colombiano</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: BANNER ── */}
      {/* ── TAB: ANUNCIO ── */}
      {tab === 'anuncio' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">

            {/* Toggle principal */}
            <VisibilityToggle
              label="Mostrar barra de anuncio"
              description={anuncioVisible ? 'Visible en la parte superior del sitio' : 'Anuncio desactivado'}
              checked={anuncioVisible}
              onChange={setAnuncioVisible}
            />

            <div className={`flex flex-col gap-4 ${!anuncioVisible ? 'opacity-40 pointer-events-none' : ''}`}>
              {/* Texto */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                    <IconSpeakerphone size={15} style={{ color: '#E11D2E' }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">Mensaje del anuncio</p>
                </div>
                <textarea
                  value={anuncioTexto}
                  onChange={(e) => setAnuncioTexto(e.target.value)}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="🦇 Restock disponible — Stock limitado, no te quedes sin tu talla"
                />
                <p className="text-xs text-gray-400">Puedes incluir emojis y ubicación. Aparece en la barra roja.</p>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Enlace al hacer clic (opcional)
                  </label>
                  <input
                    type="text"
                    value={anuncioLink}
                    onChange={(e) => setAnuncioLink(e.target.value)}
                    placeholder="/catalogo"
                    className={inputCls}
                  />
                  <p className="text-xs text-gray-400 mt-1">Ej: /catalogo, /catalogo?cat=marinette</p>
                </div>
              </div>

              {/* Expiración */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
                <p className="text-sm font-semibold text-gray-800">Vigencia del anuncio</p>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Fecha y hora de vencimiento
                  </label>
                  <input
                    type="datetime-local"
                    value={anuncioExpira}
                    onChange={(e) => setAnuncioExpira(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  El anuncio se ocultará automáticamente cuando llegue esta fecha.
                  Déjalo vacío para que no expire.
                </p>
                {anuncioExpira && (() => {
                  const diff = new Date(anuncioExpira).getTime() - Date.now()
                  if (diff <= 0) return <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">⚠️ Esta fecha ya pasó — el anuncio no se mostrará</p>
                  const h = Math.floor(diff / 3600000)
                  const d = Math.floor(h / 24)
                  const label = d > 0 ? `${d} día${d > 1 ? 's' : ''} y ${h % 24}h` : `${h}h`
                  return <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">✅ Se mostrará por {label} más</p>
                })()}
              </div>

              {/* Atajos rápidos */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Atajos de duración</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '6 horas', h: 6 },
                    { label: '12 horas', h: 12 },
                    { label: '24 horas', h: 24 },
                    { label: '48 horas', h: 48 },
                    { label: '72 horas', h: 72 },
                    { label: '1 semana', h: 168 },
                  ].map(({ label, h }) => (
                    <button key={h} type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + h * 3600000)
                        setAnuncioExpira(d.toISOString().slice(0, 16))
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Vista previa</p>
            {anuncioVisible && anuncioTexto ? (
              <div>
                <div className="flex items-center justify-between gap-3 px-4 py-3 text-white text-sm font-medium rounded-xl mb-2"
                  style={{ backgroundColor: '#E11D2E' }}>
                  <span className="text-center flex-1 text-xs">{anuncioTexto}</span>
                  {anuncioExpira && new Date(anuncioExpira) > new Date() && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                      ⏱ {(() => {
                        const diff = new Date(anuncioExpira).getTime() - Date.now()
                        const h = Math.floor(diff / 3600000)
                        return h >= 24 ? `${Math.floor(h/24)}d ${h%24}h` : `${h}h`
                      })()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 text-center">↑ Así se ve en la parte superior del sitio</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <p className="text-sm text-gray-400 mb-1">Sin anuncio activo</p>
                <p className="text-xs text-gray-300">Activa el toggle y escribe un mensaje</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'banner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">

            {/* Toggle banner completo */}
            <VisibilityToggle
              label="Mostrar banner"
              description={heroVisible ? 'El banner es visible en la página de inicio' : 'El banner está oculto'}
              checked={heroVisible}
              onChange={setHeroVisible}
            />

            {!heroVisible && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                <span className="text-amber-500 text-base shrink-0">⚠️</span>
                <p className="text-xs text-amber-700 font-medium">El banner está oculto en el sitio. Actívalo para que los clientes lo vean.</p>
              </div>
            )}

            <div style={{ opacity: heroVisible ? 1 : 0.4, pointerEvents: heroVisible ? 'auto' : 'none' }} className="flex flex-col gap-4">

              {/* Toggle imágenes */}
              <VisibilityToggle
                label="Mostrar slider de imágenes"
                description={heroImagenesVisible ? 'Se muestra el carrusel de imágenes del banner' : 'El banner aparece solo con texto, sin imágenes'}
                checked={heroImagenesVisible}
                onChange={setHeroImagenesVisible}
              />

              {/* Imágenes del slider */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Imágenes del slider</p>
                    <p className="text-xs text-gray-400 mt-0.5">Sube fotos promocionales o de campaña (máx. 6)</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                    {bannerImagenes.length}/6
                  </span>
                </div>

                {bannerImagenes.length === 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                    Sin imágenes propias: por ahora se muestran las fotos de los <strong>productos destacados</strong> del catálogo.
                  </p>
                ) : null}

                <div className="flex gap-2 flex-wrap">
                  {bannerImagenes.map((url, i) => (
                    <div key={url} className="relative group"
                      draggable
                      onDragStart={() => setBannerDragIndex(i)}
                      onDragOver={(e) => { e.preventDefault(); setBannerOverIndex(i) }}
                      onDragLeave={() => setBannerOverIndex((prev) => (prev === i ? null : prev))}
                      onDrop={(e) => { e.preventDefault(); handleBannerDrop(i) }}
                      onDragEnd={() => { setBannerDragIndex(null); setBannerOverIndex(null) }}
                      style={{
                        opacity: bannerDragIndex === i ? 0.4 : 1,
                        transform: bannerOverIndex === i && bannerDragIndex !== null && bannerDragIndex !== i ? 'scale(1.06)' : 'scale(1)',
                        transition: 'transform 0.1s, opacity 0.1s',
                      }}>
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
                        style={{ border: i === 0 ? '2px solid #E11D2E' : '2px solid #E5E7EB' }}>
                        <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
                        <span className="absolute bottom-0 right-0 bg-black/40 text-white rounded-tl-md p-0.5 leading-none">
                          <IconGripVertical size={10} />
                        </span>
                        {i === 0 && (
                          <span className="absolute top-0 left-0 text-[8px] font-bold text-white px-1 rounded-br-md"
                            style={{ backgroundColor: '#E11D2E' }}>1ª</span>
                        )}
                      </div>
                      <button type="button"
                        onClick={() => setBannerImagenes((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </button>
                    </div>
                  ))}
                  {bannerImagenes.length < 6 && (
                    <label className={`w-16 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${bannerUploading ? 'border-gray-100 opacity-50' : 'border-gray-200 cursor-pointer hover:border-red-300'}`}>
                      <IconUpload size={16} className="text-gray-300" />
                      {bannerUploading && <span className="text-[8px] text-gray-400 mt-0.5 text-center px-1">{bannerUploadProgress}</span>}
                      <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={handleBannerUpload} disabled={bannerUploading} />
                    </label>
                  )}
                </div>
                {bannerUploadError && <p className="text-xs text-red-500">{bannerUploadError}</p>}
                {bannerImagenes.length > 0 && <p className="text-[11px] text-gray-400">Arrastra para ordenar · la primera es la que se muestra primero en el slider</p>}
              </div>

              {/* Barra de características */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Barra de características</p>
                    <p className="text-xs text-gray-400 mt-0.5">Aparece debajo del banner principal</p>
                  </div>
                  <Switch checked={stripVisible} onChange={setStripVisible} size="sm" />
                </div>
                {!stripVisible && <p className="text-xs text-amber-500 bg-amber-50 px-3 py-2 rounded-lg">⚠️ La barra está oculta</p>}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${!stripVisible ? 'opacity-40 pointer-events-none' : ''}`}>
                  {[
                    [stripItem1, setStripItem1],
                    [stripItem2, setStripItem2],
                    [stripItem3, setStripItem3],
                    [stripItem4, setStripItem4],
                  ].map(([val, setter]: any, i) => (
                    <input key={i} value={val} onChange={(e) => setter(e.target.value)}
                      className={inputCls} placeholder={`Item ${i + 1}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400">Incluye el emoji al inicio. Ej: 🦇 Texto aquí</p>
              </div>

              {/* Campos de texto */}
              <Field label="Badge (etiqueta pequeña)" value={heroBadge} onChange={setHeroBadge}
                placeholder="🦇 Restock en preventa" hint="Texto pequeño arriba del título" inputCls={inputCls} />
              <Field label="Título principal" value={heroTitulo} onChange={setHeroTitulo}
                placeholder="Hago lo que quiero vestir" hint="Título grande del banner" inputCls={inputCls} />
              <FieldArea label="Subtítulo" value={heroSubtitulo} onChange={setHeroSubtitulo}
                placeholder="Lujo oscuro. Essence of Dark Fashion. Piezas streetwear de edición limitada..." inputCls={inputCls} />
              <Field label="Texto del botón" value={heroBoton} onChange={setHeroBoton}
                placeholder="Ver colección →" inputCls={inputCls} />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vista previa</p>

            {/* Banner completo: texto + imágenes */}
            <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #fff5f5 0%, #fffafa 100%)' }}>
              {!heroVisible && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                  <div className="text-center">
                    <p className="text-2xl mb-1">🙈</p>
                    <p className="text-sm font-semibold text-gray-500">Banner oculto</p>
                    <p className="text-xs text-gray-400">No se muestra en el sitio</p>
                  </div>
                </div>
              )}
              <div className={`flex gap-3 p-5 ${heroImagenesVisible ? '' : 'justify-center'}`}>

                {/* Texto */}
                <div className={`flex flex-col justify-center gap-2 ${heroImagenesVisible ? 'flex-1 min-w-0' : 'text-center max-w-[220px]'}`}>
                  <span className="inline-block self-start text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full"
                    style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                    {heroBadge || '🦇 Badge'}
                  </span>
                  <p className="font-serif text-base font-bold leading-tight" style={{ color: '#E11D2E' }}>
                    {heroTitulo || 'Título'}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">{heroSubtitulo}</p>
                  <span className="self-start inline-block text-[10px] font-semibold text-white px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: '#E11D2E' }}>
                    {heroBoton || 'Botón'}
                  </span>
                </div>

                {/* Imágenes — placeholder tipo mosaico */}
                {heroImagenesVisible && (
                  <div className="grid grid-cols-2 gap-1.5 shrink-0" style={{ width: '55%' }}>
                    <div className="row-span-2 rounded-xl bg-gray-200 flex items-center justify-center text-gray-300 text-xs" style={{ minHeight: 100 }}>
                      📸
                    </div>
                    <div className="rounded-xl bg-gray-200 flex items-center justify-center text-gray-300 text-[10px]">
                      📸
                    </div>
                    <div className="rounded-xl bg-gray-200 flex items-center justify-center text-gray-300 text-[10px]">
                      📸
                    </div>
                  </div>
                )}
              </div>

              {heroImagenesVisible && (
                <p className="text-[9px] text-gray-400 text-center pb-2">
                  Las fotos son los productos destacados del catálogo
                </p>
              )}
            </div>

            {/* Strip preview */}
            {stripVisible ? (
              <div className="border border-gray-100 rounded-xl py-2.5 px-3" style={{ backgroundColor: '#FAFAFA' }}>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {[stripItem1, stripItem2, stripItem3, stripItem4].filter(Boolean).map((item, i, arr) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-medium">{item}</span>
                      {i < arr.length - 1 && <span className="text-gray-200 text-xs">|</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-xl py-2 text-center">
                <p className="text-[10px] text-gray-300">Barra de características oculta</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: TEXTOS ── */}
      {tab === 'textos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Sección CTA</p>
                <Switch checked={ctaVisible} onChange={setCtaVisible} size="sm" />
              </div>
              {!ctaVisible && <p className="text-xs text-amber-500 bg-amber-50 px-3 py-2 rounded-lg">⚠️ Esta sección está oculta en el sitio</p>}
              <div className={ctaVisible ? '' : 'opacity-40 pointer-events-none'}>
              <Field label="Título" value={ctaTitulo} onChange={setCtaTitulo}
                placeholder="¿Tienes alguna consulta?" inputCls={inputCls} />
              <FieldArea label="Subtítulo" value={ctaSubtitulo} onChange={setCtaSubtitulo}
                placeholder="Te asesoramos personalmente..." inputCls={inputCls} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
              <p className="text-sm font-semibold text-gray-800">Footer</p>
              <FieldArea label="Descripción de la tienda" value={footerDesc} onChange={setFooterDesc}
                placeholder="Lujo oscuro / Essence of Dark Fashion. Piezas streetwear de edición limitada..." inputCls={inputCls} />
              <Field label="Política (texto pequeño)" value={footerPolitica} onChange={setFooterPolitica}
                placeholder="No hacemos cambios ni devoluciones 🦇" inputCls={inputCls} />
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  Items de información
                  <span className="normal-case font-normal ml-1 text-gray-400">(hasta 4, déjalos vacíos para no mostrarlos)</span>
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    [footerInfo1, setFooterInfo1, 'Ej: Preventas por tiempo limitado'],
                    [footerInfo2, setFooterInfo2, 'Ej: Envíos a nivel nacional'],
                    [footerInfo3, setFooterInfo3, 'Ej: Piezas de edición limitada'],
                    [footerInfo4, setFooterInfo4, 'Ej: Paga por WhatsApp'],
                  ].map(([val, setter, ph]: any, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-red-400 font-bold text-sm">•</span>
                      <input value={val} onChange={(e) => setter(e.target.value)}
                        className={inputCls} placeholder={ph} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview completo */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vista previa</p>

            {/* CTA preview */}
            {ctaVisible ? (
              <div className="rounded-2xl p-6 text-center"
                style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)' }}>
                <p className="text-xl mb-1.5">🦇</p>
                <h3 className="font-serif text-base font-bold text-gray-900 mb-1.5">{ctaTitulo}</h3>
                <p className="text-[10px] text-gray-500 mb-3 max-w-[200px] mx-auto">{ctaSubtitulo}</p>
                <span className="inline-block text-[10px] font-semibold text-white px-4 py-1.5 rounded-full"
                  style={{ backgroundColor: '#25D366' }}>
                  💬 Hablar por WhatsApp
                </span>
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-2xl py-4 text-center">
                <p className="text-[10px] text-gray-300">Sección CTA oculta</p>
              </div>
            )}

            {/* Footer preview */}
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <div className="bg-gray-900 p-3">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Footer preview</p>
                <p className="text-[11px] text-white font-serif font-bold mb-1">{footerDesc ? footerDesc.slice(0, 40) + '…' : 'Descripción'}</p>
                {footerPolitica && <p className="text-[9px] text-red-400 mb-2">{footerPolitica}</p>}
                <div className="flex flex-col gap-1">
                  {[footerInfo1, footerInfo2, footerInfo3, footerInfo4].filter(Boolean).map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-red-500 text-[8px]">•</span>
                      <p className="text-[9px] text-gray-400">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: MENSAJES ── */}
      {tab === 'mensajes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-0.5">Plantilla del mensaje WhatsApp</p>
              <p className="text-xs text-gray-400">Mensaje que llega al hacer un pedido</p>
            </div>
            <textarea value={template} onChange={(e) => setTemplate(e.target.value)}
              rows={10} className={`${inputCls} resize-none font-mono text-xs leading-relaxed`}
              placeholder={`Hola! Quiero hacer este pedido 🦇\n\n📦 #{orderId}\n\n{productos}\n\n💰 Total: S/ {total}\n\n🔍 Rastrear: {trackingLink}`} />
            <div className="flex flex-wrap gap-1.5">
              {['{orderId}', '{productos}', '{total}', '{trackingLink}'].map((v) => (
                <code key={v} onClick={() => setTemplate((t: string) => t + v)}
                  className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors">
                  {v}
                </code>
              ))}
              <span className="text-xs text-gray-400 self-center">← toca para insertar</span>
            </div>
          </div>

          {/* Preview mensaje */}
          {template && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Vista previa</p>
              <div className="rounded-xl p-4" style={{ backgroundColor: '#ECE5DD' }}>
                <div className="bg-white rounded-xl px-4 py-3 shadow-sm max-w-xs ml-auto">
                  <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {template.replace(/\\n/g, '\n')
                      .replace('{orderId}', 'ORD-001')
                      .replace('{productos}', '• 1x Botas Peluche (Negro)\n  _Talla 37_ — S/ 150')
                      .replace('{total}', '150')
                      .replace('{trackingLink}', 'anarchyy.pe/pedido/ORD-001')}
                  </p>
                  <p className="text-[10px] text-gray-400 text-right mt-1.5">12:30 ✓✓</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <div className="mt-5">
        <button type="submit" disabled={isPending}
          className="w-full sm:w-auto sm:min-w-[200px] font-semibold py-3.5 px-8 rounded-full text-white transition-all disabled:opacity-60 hover:opacity-90 shadow-md"
          style={{ backgroundColor: saved ? '#10B981' : '#E11D2E', boxShadow: saved ? '0 4px 15px rgba(16,185,129,0.3)' : '0 4px 15px rgba(225,29,46,0.3)' }}>
          {saved ? '¡Guardado!' : isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

// Componentes helper
function Field({ label, value, onChange, placeholder, hint, inputCls }: any) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={placeholder} />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function FieldArea({ label, value, onChange, placeholder, inputCls }: any) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
        className={`${inputCls} resize-none`} placeholder={placeholder} />
    </div>
  )
}

function VisibilityToggle({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: checked ? '#FEE2E2' : '#F3F4F6' }}>
          {checked
            ? <IconEye size={15} style={{ color: '#E11D2E' }} />
            : <IconEyeOff size={15} className="text-gray-400" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  )
}
