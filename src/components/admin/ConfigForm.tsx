'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { IconBrandWhatsapp, IconCheck, IconMail, IconBuildingStore, IconPhoto, IconEye, IconEyeOff, IconSettings, IconSpeakerphone, IconUpload, IconGripVertical, IconBrandInstagram, IconBrandTiktok, IconShare, IconLayoutBottombar } from '@tabler/icons-react'
import { Switch } from '@/components/ui/Switch'

interface ConfigData {
  id: string
  tienda_nombre?: string | null
  whatsapp_numero?: string | null
  moneda?: string | null
  email_notificaciones?: string | null
  hero_badge?: string | null
  hero_titulo?: string | null
  hero_subtitulo?: string | null
  hero_boton?: string | null
  hero_visible?: boolean | null
  hero_imagenes_visible?: boolean | null
  banner_imagenes?: string[] | null
  banner_links?: string[] | null
  strip_visible?: boolean | null
  strip_item1?: string | null
  strip_item2?: string | null
  strip_item3?: string | null
  strip_item4?: string | null
  footer_descripcion?: string | null
  footer_politica?: string | null
  footer_info1?: string | null
  footer_info2?: string | null
  footer_info3?: string | null
  footer_info4?: string | null
  footer_email?: string | null
  footer_tagline?: string | null
  redes_instagram?: string | null
  redes_tiktok?: string | null
  whatsapp_template?: string | null
  anuncio_visible?: boolean | null
  anuncio_texto?: string | null
  anuncio_link?: string | null
  anuncio_expira?: string | null
  empresa_razon_social?: string | null
  empresa_ruc?: string | null
  empresa_direccion?: string | null
}

interface Props { config: ConfigData | null }

const TABS = [
  { id: 'tienda',   label: 'Tienda',    icon: IconBuildingStore },
  { id: 'anuncio',  label: 'Anuncio',   icon: IconSettings },
  { id: 'banner',   label: 'Banner',    icon: IconPhoto },
  { id: 'textos',   label: 'Footer',    icon: IconLayoutBottombar },
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
  const [now] = useState(() => Date.now())

  // Tienda
  const [tiendaNombre,      setTiendaNombre]      = useState(config?.tienda_nombre      ?? '')
  const [whatsappNumero,    setWhatsappNumero]    = useState(config?.whatsapp_numero    ?? '')
  const [moneda,            setMoneda]            = useState(config?.moneda             ?? 'PEN')
  const [emailNotif,        setEmailNotif]        = useState(config?.email_notificaciones ?? '')
  const [empresaRazonSocial, setEmpresaRazonSocial] = useState(config?.empresa_razon_social ?? '')
  const [empresaRuc,         setEmpresaRuc]         = useState(config?.empresa_ruc          ?? '')
  const [empresaDireccion,   setEmpresaDireccion]   = useState(config?.empresa_direccion    ?? '')

  // Banner
  const [heroBadge,           setHeroBadge]           = useState(config?.hero_badge             ?? '🦇 Restock en preventa')
  const [heroTitulo,          setHeroTitulo]          = useState(config?.hero_titulo            ?? 'Hago lo que quiero vestir')
  const [heroSubtitulo,       setHeroSubtitulo]       = useState(config?.hero_subtitulo         ?? 'Lujo oscuro. Essence of Dark Fashion. Piezas streetwear de edición limitada.')
  const [heroBoton,           setHeroBoton]           = useState(config?.hero_boton             ?? 'Ver colección →')
  const [heroVisible,         setHeroVisible]         = useState(config?.hero_visible           ?? true)
  const [heroImagenesVisible, setHeroImagenesVisible] = useState(config?.hero_imagenes_visible  ?? true)
  const [bannerImagenes,      setBannerImagenes]      = useState<string[]>(config?.banner_imagenes ?? [])
  const [bannerLinks,         setBannerLinks]         = useState<string[]>(() => {
    const imgs = config?.banner_imagenes ?? []
    const links = config?.banner_links ?? []
    return imgs.map((_: string, i: number) => links[i] ?? '')
  })
  const [bannerUploading,     setBannerUploading]     = useState(false)
  const [bannerUploadProgress, setBannerUploadProgress] = useState('')
  const [bannerUploadError,   setBannerUploadError]   = useState('')
  const [bannerDragIndex,     setBannerDragIndex]     = useState<number | null>(null)
  const [bannerOverIndex,     setBannerOverIndex]     = useState<number | null>(null)

  // Textos
  const [footerDesc,      setFooterDesc]      = useState(config?.footer_descripcion ?? 'Lujo oscuro / Essence of Dark Fashion. Piezas streetwear de edición limitada — hago lo que quiero vestir.')
  const [footerPolitica,  setFooterPolitica]  = useState(config?.footer_politica   ?? '')
  const [footerInfo1,     setFooterInfo1]     = useState(config?.footer_info1      ?? 'Preventas por tiempo limitado')
  const [footerInfo2,     setFooterInfo2]     = useState(config?.footer_info2      ?? 'Envíos a nivel nacional')
  const [footerInfo3,     setFooterInfo3]     = useState(config?.footer_info3      ?? '')
  const [footerInfo4,     setFooterInfo4]     = useState(config?.footer_info4      ?? '')
  const [footerEmail,     setFooterEmail]     = useState(config?.footer_email      ?? 'contacto@anarchyy.pe')
  const [footerTagline,   setFooterTagline]   = useState(config?.footer_tagline    ?? '')
  const [redesInstagram,  setRedesInstagram]  = useState(config?.redes_instagram   ?? '')
  const [redesTiktok,     setRedesTiktok]     = useState(config?.redes_tiktok      ?? '')
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
    setBannerLinks((prev) => [...prev, ...urls.map(() => '')])
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
    setBannerLinks((prev) => {
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
        empresa_razon_social: empresaRazonSocial.trim() || null,
        empresa_ruc: empresaRuc.trim() || null,
        empresa_direccion: empresaDireccion.trim() || null,
        hero_badge: heroBadge,
        hero_titulo: heroTitulo,
        hero_subtitulo: heroSubtitulo,
        hero_boton: heroBoton,
        hero_visible: heroVisible,
        hero_imagenes_visible: heroImagenesVisible,
        banner_imagenes: bannerImagenes,
        banner_links: bannerLinks,
        footer_descripcion: footerDesc,
        footer_politica: footerPolitica,
        footer_info1: footerInfo1,
        footer_info2: footerInfo2,
        footer_info3: footerInfo3,
        footer_info4: footerInfo4,
        footer_email: footerEmail.trim() || null,
        footer_tagline: footerTagline,
        redes_instagram: redesInstagram.trim() || null,
        redes_tiktok: redesTiktok.trim() || null,
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

          {/* Datos de la empresa */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <IconBuildingStore size={16} className="text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Datos de la empresa</p>
                <p className="text-xs text-gray-400">Aparecen en el Libro de Reclamaciones</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Razón social</label>
                <input value={empresaRazonSocial} onChange={(e) => setEmpresaRazonSocial(e.target.value)}
                  className={inputCls} placeholder="Anarchyy E.I.R.L." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">RUC</label>
                <input value={empresaRuc} onChange={(e) => setEmpresaRuc(e.target.value)}
                  className={inputCls} placeholder="20123456789" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Dirección</label>
                <input value={empresaDireccion} onChange={(e) => setEmpresaDireccion(e.target.value)}
                  className={inputCls} placeholder="Av. Principal 123, Lima" />
              </div>
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
                  const diff = new Date(anuncioExpira).getTime() - now
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
                        const diff = new Date(anuncioExpira).getTime() - now
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
                ) : (
                  <p className="text-[11px] text-gray-400">
                    El campo bajo cada imagen es el link al que redirige (ej: <code className="bg-gray-100 px-1 rounded">/catalogo</code> o <code className="bg-gray-100 px-1 rounded">/catalogo/mi-producto</code>). Vacío = /catalogo.
                  </p>
                )}

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
                        <Image src={url} alt="" fill className="object-cover pointer-events-none" />
                        <span className="absolute bottom-0 right-0 bg-black/40 text-white rounded-tl-md p-0.5 leading-none">
                          <IconGripVertical size={10} />
                        </span>
                        {i === 0 && (
                          <span className="absolute top-0 left-0 text-[8px] font-bold text-white px-1 rounded-br-md"
                            style={{ backgroundColor: '#E11D2E' }}>1ª</span>
                        )}
                      </div>
                      <button type="button"
                        onClick={() => {
                          setBannerImagenes((prev) => prev.filter((_, j) => j !== i))
                          setBannerLinks((prev) => prev.filter((_, j) => j !== i))
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </button>
                      <input
                        type="text"
                        value={bannerLinks[i] ?? ''}
                        onChange={(e) => setBannerLinks((prev) => {
                          const next = [...prev]
                          next[i] = e.target.value
                          return next
                        })}
                        placeholder="/catalogo"
                        className="mt-1 w-16 text-[10px] text-center border border-gray-200 rounded-md px-1 py-0.5 outline-none focus:border-red-400 bg-white text-gray-900"
                      />
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
                  {([
                    [stripItem1, setStripItem1],
                    [stripItem2, setStripItem2],
                    [stripItem3, setStripItem3],
                    [stripItem4, setStripItem4],
                  ] as [string, (v: string) => void][]).map(([val, setter], i) => (
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
          <div className="hidden lg:flex bg-white rounded-2xl border border-gray-100 p-5 flex-col gap-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vista previa</p>

            {/* Banner completo: texto + imágenes */}
            <div className="rounded-2xl overflow-hidden relative" style={{ backgroundColor: '#121214' }}>
              {!heroVisible && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                  <div className="text-center">
                    <p className="text-2xl mb-1">🙈</p>
                    <p className="text-sm font-semibold text-gray-200">Banner oculto</p>
                    <p className="text-xs text-gray-400">No se muestra en el sitio</p>
                  </div>
                </div>
              )}
              <div className={`flex gap-3 p-5 ${heroImagenesVisible ? '' : 'justify-center'}`}>

                {/* Texto */}
                <div className={`flex flex-col justify-center gap-2 ${heroImagenesVisible ? 'flex-1 min-w-0' : 'text-center max-w-[220px] items-center'}`}>
                  <span className="inline-flex items-center gap-1.5 self-start text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full"
                    style={{ backgroundColor: '#3A1014', color: '#FF6B7A' }}>
                    <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: '#E11D2E' }} />
                    {heroBadge || '🦇 Badge'}
                  </span>
                  <p className="font-display text-base font-bold leading-tight">
                    {(heroTitulo || 'Título').split(' ').map((word: string, i: number, arr: string[]) => (
                      <span key={i}>
                        <span style={{ color: i >= Math.floor(arr.length / 2) ? '#E11D2E' : '#F5F5F2' }}>{word}</span>
                        {i < arr.length - 1 && ' '}
                      </span>
                    ))}
                  </p>
                  <p className="text-[10px] text-[#9A9A9E] leading-relaxed line-clamp-2">{heroSubtitulo}</p>
                  <span className="self-start inline-block text-[10px] font-semibold text-white px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: '#E11D2E' }}>
                    {heroBoton || 'Botón'}
                  </span>
                </div>

                {/* Imágenes — placeholder tipo slider */}
                {heroImagenesVisible && (
                  <div className="relative shrink-0 rounded-xl flex flex-col items-center justify-center gap-2 text-[#5A5A5E] text-xs"
                    style={{ width: '55%', minHeight: 120, backgroundColor: '#1F1F22' }}>
                    📸
                    {/* Dots del slider */}
                    <div className="absolute bottom-2 flex items-center gap-1">
                      {Array.from({ length: Math.min(bannerImagenes.length || 3, 6) }).map((_, i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i === 0 ? '#E11D2E' : '#3A3A3E' }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {heroImagenesVisible && (
                <p className="text-[9px] text-[#6B6B70] text-center pb-2">
                  {bannerImagenes.length > 0 ? 'Tus imágenes subidas' : 'Las fotos son los productos destacados del catálogo'}
                </p>
              )}
            </div>

            {/* Strip preview */}
            {stripVisible ? (
              <div className="border rounded-xl py-2.5 px-3" style={{ backgroundColor: '#161618', borderColor: '#2C2C30' }}>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {[stripItem1, stripItem2, stripItem3, stripItem4].filter(Boolean).map((item, i, arr) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-[#9A9A9E] font-medium">{item}</span>
                      {i < arr.length - 1 && <span className="text-[#2C2C30] text-xs">|</span>}
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                  <IconLayoutBottombar size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Footer</p>
                  <p className="text-xs text-gray-400">Pie de página del sitio</p>
                </div>
              </div>
              <FieldArea label="Descripción de la tienda" value={footerDesc} onChange={setFooterDesc}
                placeholder="Lujo oscuro / Essence of Dark Fashion. Piezas streetwear de edición limitada..." inputCls={inputCls} />
              <Field label="Política (texto pequeño)" value={footerPolitica} onChange={setFooterPolitica}
                placeholder="Opcional — déjalo vacío para no mostrar nada" inputCls={inputCls} />
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  Items de información
                  <span className="normal-case font-normal ml-1 text-gray-400">(hasta 4, déjalos vacíos para no mostrarlos)</span>
                </label>
                <div className="flex flex-col gap-2">
                  {([
                    [footerInfo1, setFooterInfo1, 'Ej: Preventas por tiempo limitado'],
                    [footerInfo2, setFooterInfo2, 'Ej: Envíos a nivel nacional'],
                    [footerInfo3, setFooterInfo3, 'Ej: Piezas de edición limitada'],
                    [footerInfo4, setFooterInfo4, 'Ej: Paga por WhatsApp'],
                  ] as [string, (v: string) => void, string][]).map(([val, setter, ph], i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-red-400 font-bold text-sm">•</span>
                      <input value={val} onChange={(e) => setter(e.target.value)}
                        className={inputCls} placeholder={ph} />
                    </div>
                  ))}
                </div>
              </div>
              <Field label="Email de contacto" value={footerEmail} onChange={setFooterEmail}
                placeholder="contacto@anarchyy.pe" hint="Aparece en el footer (ícono y sección de contacto)" inputCls={inputCls} />
              <Field label="Frase final (barra inferior)" value={footerTagline} onChange={setFooterTagline}
                placeholder="Hago lo que quiero vestir 🦇" hint="Déjalo vacío para no mostrar nada" inputCls={inputCls} />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                  <IconShare size={16} style={{ color: '#E11D2E' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Redes sociales</p>
                  <p className="text-xs text-gray-400">Íconos que aparecen en el footer</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5 border-2 rounded-xl px-3.5 py-2.5"
                  style={{ borderColor: redesInstagram ? '#E11D2E' : '#E5E7EB' }}>
                  <IconBrandInstagram size={18} className="shrink-0" style={{ color: redesInstagram ? '#E11D2E' : '#9CA3AF' }} />
                  <input value={redesInstagram} onChange={(e) => setRedesInstagram(e.target.value)}
                    className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-white"
                    placeholder="https://instagram.com/anarchyy.pe" />
                </div>
                <div className="flex items-center gap-2.5 border-2 rounded-xl px-3.5 py-2.5"
                  style={{ borderColor: redesTiktok ? '#E11D2E' : '#E5E7EB' }}>
                  <IconBrandTiktok size={18} className="shrink-0" style={{ color: redesTiktok ? '#E11D2E' : '#9CA3AF' }} />
                  <input value={redesTiktok} onChange={(e) => setRedesTiktok(e.target.value)}
                    className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-white"
                    placeholder="https://tiktok.com/@anarchyy.pe" />
                </div>
              </div>
              <p className="text-xs text-gray-400">Pega el link completo del perfil. Déjalo vacío para no mostrar ese ícono.</p>
            </div>
          </div>

          {/* Preview completo */}
          <div className="hidden lg:flex bg-white rounded-2xl border border-gray-100 p-5 flex-col gap-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vista previa</p>

            {/* Footer preview */}
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <div className="p-4" style={{ backgroundColor: '#121214' }}>
                {/* Marca */}
                <p className="font-display text-base tracking-widest mb-1.5" style={{ color: '#F5F5F2' }}>
                  {tiendaNombre || 'Anarchyy.pe'}
                </p>
                <p className="text-[10px] leading-relaxed mb-2.5 max-w-[220px]" style={{ color: '#9A9A9E' }}>
                  {footerDesc ? footerDesc.slice(0, 70) + (footerDesc.length > 70 ? '…' : '') : 'Descripción de la tienda'}
                </p>

                {/* Íconos sociales */}
                <div className="flex items-center gap-1.5 mb-3">
                  {whatsappNumero && (
                    <span className="w-6 h-6 rounded-lg border flex items-center justify-center" style={{ borderColor: '#2C2C30', color: '#9A9A9E', backgroundColor: '#161618' }}>
                      <IconBrandWhatsapp size={12} />
                    </span>
                  )}
                  {footerEmail && (
                    <span className="w-6 h-6 rounded-lg border flex items-center justify-center" style={{ borderColor: '#2C2C30', color: '#9A9A9E', backgroundColor: '#161618' }}>
                      <IconMail size={12} />
                    </span>
                  )}
                  {redesInstagram && (
                    <span className="w-6 h-6 rounded-lg border flex items-center justify-center" style={{ borderColor: '#2C2C30', color: '#9A9A9E', backgroundColor: '#161618' }}>
                      <IconBrandInstagram size={12} />
                    </span>
                  )}
                  {redesTiktok && (
                    <span className="w-6 h-6 rounded-lg border flex items-center justify-center" style={{ borderColor: '#2C2C30', color: '#9A9A9E', backgroundColor: '#161618' }}>
                      <IconBrandTiktok size={12} />
                    </span>
                  )}
                  {!whatsappNumero && !footerEmail && !redesInstagram && !redesTiktok && (
                    <p className="text-[9px]" style={{ color: '#9A9A9E' }}>Sin íconos de contacto configurados</p>
                  )}
                </div>

                {/* Información */}
                {(footerPolitica || footerInfo1 || footerInfo2 || footerInfo3 || footerInfo4) && (
                  <div className="flex flex-col gap-1.5 pt-2.5 mb-2.5" style={{ borderTop: '1px solid #2C2C30' }}>
                    {footerPolitica && (
                      <p className="text-[10px] leading-relaxed pb-1.5" style={{ color: '#9A9A9E', borderBottom: '1px solid #2C2C30' }}>{footerPolitica}</p>
                    )}
                    {[footerInfo1, footerInfo2, footerInfo3, footerInfo4].filter(Boolean).map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: '#E11D2E' }} />
                        <p className="text-[10px] leading-snug" style={{ color: '#9A9A9E' }}>{item}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contacto */}
                {(footerEmail || whatsappNumero) && (
                  <div className="flex flex-col gap-1 pt-2.5 mb-2.5" style={{ borderTop: '1px solid #2C2C30' }}>
                    {whatsappNumero && (
                      <p className="text-[10px] flex items-center gap-1.5" style={{ color: '#9A9A9E' }}>
                        <IconBrandWhatsapp size={11} className="shrink-0" /> +{whatsappNumero.replace(/\s/g, '')}
                      </p>
                    )}
                    {footerEmail && (
                      <p className="text-[10px] flex items-center gap-1.5" style={{ color: '#9A9A9E' }}>
                        <IconMail size={11} className="shrink-0" /> {footerEmail}
                      </p>
                    )}
                  </div>
                )}

                {/* Bottom bar */}
                <div className="flex items-center justify-between gap-2 pt-2.5" style={{ borderTop: '1px solid #2C2C30' }}>
                  <p className="text-[9px]" style={{ color: '#9A9A9E' }}>© {new Date().getFullYear()} {tiendaNombre || 'Anarchyy.pe'}</p>
                  {footerTagline && (
                    <p className="text-[9px] font-medium text-right" style={{ color: '#E11D2E' }}>{footerTagline}</p>
                  )}
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
                      .replace('{trackingLink}', 'anarchyy.pe/rastrear?order=ORD-001')}
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
interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
  inputCls: string
}

function Field({ label, value, onChange, placeholder, hint, inputCls }: FieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={placeholder} />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function FieldArea({ label, value, onChange, placeholder, inputCls }: Omit<FieldProps, 'hint'>) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
        className={`${inputCls} resize-none`} placeholder={placeholder} />
    </div>
  )
}

interface VisibilityToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function VisibilityToggle({ label, description, checked, onChange }: VisibilityToggleProps) {
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
