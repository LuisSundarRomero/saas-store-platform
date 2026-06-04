'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { IconBrandWhatsapp, IconCheck, IconMail, IconBuildingStore, IconPhoto, IconFileText, IconEye, IconEyeOff, IconSettings, IconSpeakerphone } from '@tabler/icons-react'
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
  const [heroBadge,     setHeroBadge]     = useState(config?.hero_badge     ?? '🎀 Nueva colección disponible')
  const [heroTitulo,    setHeroTitulo]    = useState(config?.hero_titulo    ?? 'Zapatos que te hacen brillar')
  const [heroSubtitulo, setHeroSubtitulo] = useState(config?.hero_subtitulo ?? 'Modelos coquette únicos y originales.')
  const [heroBoton,     setHeroBoton]     = useState(config?.hero_boton     ?? 'Ver colección →')
  const [heroVisible,   setHeroVisible]   = useState(config?.hero_visible   ?? true)
  const [nuevoDias,     setNuevoDias]     = useState(config?.nuevo_dias     ?? 14)

  // Textos
  const [ctaTitulo,       setCtaTitulo]       = useState(config?.cta_titulo        ?? '¿Tienes alguna consulta?')
  const [ctaSubtitulo,    setCtaSubtitulo]    = useState(config?.cta_subtitulo     ?? 'Te asesoramos personalmente para encontrar el modelo perfecto.')
  const [ctaVisible,      setCtaVisible]      = useState(config?.cta_visible       ?? true)
  const [footerDesc,      setFooterDesc]      = useState(config?.footer_descripcion ?? 'Zapatos coquette únicos y originales. Diseñados para quienes aman los detalles.')
  const [footerPolitica,  setFooterPolitica]  = useState(config?.footer_politica   ?? 'No hacemos cambios ni devoluciones 🎀')
  const [footerInfo1,     setFooterInfo1]     = useState(config?.footer_info1      ?? 'Solo con cita previa')
  const [footerInfo2,     setFooterInfo2]     = useState(config?.footer_info2      ?? 'Envíos a todo Lima')
  const [footerInfo3,     setFooterInfo3]     = useState(config?.footer_info3      ?? '')
  const [footerInfo4,     setFooterInfo4]     = useState(config?.footer_info4      ?? '')
  // Anuncio
  const [anuncioVisible,  setAnuncioVisible]  = useState(config?.anuncio_visible   ?? false)
  const [anuncioTexto,    setAnuncioTexto]    = useState(config?.anuncio_texto     ?? '')
  const [anuncioExpira,   setAnuncioExpira]   = useState(
    config?.anuncio_expira ? new Date(config.anuncio_expira).toISOString().slice(0, 16) : ''
  )
  const [stripVisible,    setStripVisible]    = useState(config?.strip_visible     ?? true)
  const [stripItem1,      setStripItem1]      = useState(config?.strip_item1       ?? '🎀 Diseños únicos y originales')
  const [stripItem2,      setStripItem2]      = useState(config?.strip_item2       ?? '✨ Colección coquette exclusiva')
  const [stripItem3,      setStripItem3]      = useState(config?.strip_item3       ?? '💬 Atención personalizada')
  const [stripItem4,      setStripItem4]      = useState(config?.strip_item4       ?? '🚚 Envíos a todo Lima')

  // Mensajes
  const [template, setTemplate] = useState(config?.whatsapp_template ?? '')

  const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all bg-white"

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
        nuevo_dias: Number(nuevoDias),
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
              ? { backgroundColor: '#fff', color: '#EC4899', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
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
                  className="flex-1 px-3 py-2.5 text-sm outline-none font-mono bg-white"
                  placeholder="51982121991" />
              </div>
              <p className="text-xs text-gray-400">Código de país + número. Perú: <strong>51</strong>XXXXXXXXX</p>
            </div>

            {/* Email */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center">
                  <IconMail size={16} style={{ color: '#EC4899' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Email de notificaciones</p>
                  <p className="text-xs text-gray-400">Te avisamos por cada pedido nuevo</p>
                </div>
              </div>
              <input type="email" value={emailNotif} onChange={(e) => setEmailNotif(e.target.value)}
                className={inputCls} placeholder="kuutsupe@gmail.com" />
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
                className={inputCls} placeholder="Kuutsu.pe" />
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
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FCE7F3' }}>
                    <IconSpeakerphone size={15} style={{ color: '#EC4899' }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">Mensaje del anuncio</p>
                </div>
                <textarea
                  value={anuncioTexto}
                  onChange={(e) => setAnuncioTexto(e.target.value)}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="📍 Hoy estaremos en Feria Alameda Fest — Visítanos y llévate un descuento especial 🎀"
                />
                <p className="text-xs text-gray-400">Puedes incluir emojis y ubicación. Aparece en la barra rosada.</p>
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
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600 transition-colors">
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
                  style={{ backgroundColor: '#EC4899' }}>
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
            {/* Toggle visibilidad */}
            <VisibilityToggle
              label="Mostrar banner"
              description={heroVisible ? 'El banner es visible en la página de inicio' : 'El banner está oculto'}
              checked={heroVisible}
              onChange={setHeroVisible}
            />
            <div className={heroVisible ? '' : 'opacity-40 pointer-events-none'}>
            <Field label="Badge (etiqueta pequeña)" value={heroBadge} onChange={setHeroBadge}
              placeholder="🎀 Nueva colección disponible" hint="Texto rosa pequeño arriba del título" inputCls={inputCls} />
            <Field label="Título principal" value={heroTitulo} onChange={setHeroTitulo}
              placeholder="Zapatos que te hacen brillar" hint="Título grande del banner" inputCls={inputCls} />
            <FieldArea label="Subtítulo" value={heroSubtitulo} onChange={setHeroSubtitulo}
              placeholder="Modelos coquette únicos y originales..." inputCls={inputCls} />
            <Field label="Texto del botón" value={heroBoton} onChange={setHeroBoton}
              placeholder="Ver colección →" inputCls={inputCls} />

            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">Badge "NUEVO"</p>
                <p className="text-xs text-gray-400 mt-0.5">Días desde la creación para mostrar la etiqueta</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input type="number" min={1} max={90} value={nuevoDias}
                  onChange={(e) => setNuevoDias(Number(e.target.value))}
                  className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pink-400 text-center"
                />
                <span className="text-xs text-gray-400">días</span>
              </div>
            </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Vista previa</p>
            <div className="rounded-2xl p-8 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(180deg, #fdf0f6 0%, #fff8fb 100%)' }}>
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-3"
                style={{ backgroundColor: '#FCE7F3', color: '#BE185D' }}>
                {heroBadge || '🎀 Badge'}
              </span>
              <h2 className="font-serif text-2xl font-bold mb-2 leading-tight" style={{ color: '#EC4899' }}>
                {heroTitulo || 'Título'}
              </h2>
              <p className="text-xs text-gray-500 mb-4 max-w-[200px] mx-auto">{heroSubtitulo}</p>
              <span className="inline-block text-xs font-semibold text-white px-5 py-2 rounded-full"
                style={{ backgroundColor: '#EC4899' }}>
                {heroBoton || 'Botón'}
              </span>
            </div>
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
            {/* Strip */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Barra de características</p>
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
              <p className="text-xs text-gray-400">Incluye el emoji al inicio de cada item. Ej: 🎀 Texto aquí</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
              <p className="text-sm font-semibold text-gray-800">Footer</p>
              <FieldArea label="Descripción de la tienda" value={footerDesc} onChange={setFooterDesc}
                placeholder="Zapatos coquette únicos y originales..." inputCls={inputCls} />
              <Field label="Política (texto pequeño)" value={footerPolitica} onChange={setFooterPolitica}
                placeholder="No hacemos cambios ni devoluciones 🎀" inputCls={inputCls} />
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  Items de información
                  <span className="normal-case font-normal ml-1 text-gray-400">(hasta 4, déjalos vacíos para no mostrarlos)</span>
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    [footerInfo1, setFooterInfo1, 'Ej: Solo con cita previa'],
                    [footerInfo2, setFooterInfo2, 'Ej: Envíos a todo Lima'],
                    [footerInfo3, setFooterInfo3, 'Ej: Modelos exclusivos'],
                    [footerInfo4, setFooterInfo4, 'Ej: Paga por WhatsApp'],
                  ].map(([val, setter, ph]: any, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-pink-400 font-bold text-sm">•</span>
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

            {/* Strip preview */}
            {stripVisible && (
              <div className="border border-gray-100 rounded-xl py-2.5 px-3">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {[stripItem1, stripItem2, stripItem3, stripItem4].filter(Boolean).map((item, i, arr) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-medium">{item}</span>
                      {i < arr.length - 1 && <span className="text-gray-200 text-xs">|</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!stripVisible && (
              <div className="border border-dashed border-gray-200 rounded-xl py-2.5 px-3 text-center">
                <p className="text-[10px] text-gray-300">Barra oculta</p>
              </div>
            )}

            {/* CTA preview */}
            {ctaVisible ? (
              <div className="rounded-2xl p-6 text-center"
                style={{ background: 'linear-gradient(135deg, #fdf0f6 0%, #fce7f3 100%)' }}>
                <p className="text-xl mb-1.5">🎀</p>
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
                {footerPolitica && <p className="text-[9px] text-pink-400 mb-2">{footerPolitica}</p>}
                <div className="flex flex-col gap-1">
                  {[footerInfo1, footerInfo2, footerInfo3, footerInfo4].filter(Boolean).map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-pink-500 text-[8px]">•</span>
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
              placeholder={`Hola! Quiero hacer este pedido 🎀\n\n📦 #{orderId}\n\n{productos}\n\n💰 Total: S/ {total}\n\n🔍 Rastrear: {trackingLink}`} />
            <div className="flex flex-wrap gap-1.5">
              {['{orderId}', '{productos}', '{total}', '{trackingLink}'].map((v) => (
                <code key={v} onClick={() => setTemplate((t: string) => t + v)}
                  className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs cursor-pointer hover:bg-pink-50 hover:text-pink-600 transition-colors">
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
                      .replace('{trackingLink}', 'kuutsu.pe/pedido/ORD-001')}
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
          style={{ backgroundColor: saved ? '#10B981' : '#EC4899', boxShadow: saved ? '0 4px 15px rgba(16,185,129,0.3)' : '0 4px 15px rgba(236,72,153,0.3)' }}>
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
          style={{ backgroundColor: checked ? '#FCE7F3' : '#F3F4F6' }}>
          {checked
            ? <IconEye size={15} style={{ color: '#EC4899' }} />
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
