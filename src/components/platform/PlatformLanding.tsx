import Image from 'next/image'
import {
  IconCheck, IconBrandWhatsapp, IconX,
  IconArrowRight, IconBrandLinkedin,
} from '@tabler/icons-react'
import { MobileMenu } from './MobileMenu'

const WHATSAPP = '51982121991'

const V = '#6C2BD9'
const J = '#00A389'
const VL = '#E4D9F7'
const JL = '#D6F0EA'
const BG = '#FBFAFC'
const TEXT = '#221A2E'

const NAV_LINKS = [
  { href: '#problema',       label: 'El problema' },
  { href: '#como-funciona',  label: 'Cómo funciona' },
  { href: '#planes',         label: 'Planes' },
  { href: '#proceso',        label: 'El proceso' },
  { href: '#nosotros',       label: 'Quiénes somos' },
]

const PROBLEMAS = [
  { icon: '😟', titulo: 'Pierdes ventas cuando no estás', desc: 'Tus clientes quieren comprar en cualquier momento. Si terminó tu live o no respondes rápido, pierdes la venta.' },
  { icon: '💬', titulo: 'Pedidos perdidos entre mensajes', desc: 'Fotos, precios, tallas y direcciones mezcladas en un mismo chat. Organizar todo se convierte en caos.' },
  { icon: '📊', titulo: 'No sabes cuánto vendiste', desc: 'Sin una herramienta que te ayude, controlar ventas e inventario te roba tiempo que podrías usar para crecer.' },
  { icon: '🔄', titulo: 'Respondes lo mismo todos los días', desc: '¿Tienes talla M? ¿Llegó mi pedido? Mientras respondes, podrías estar buscando nuevos clientes.' },
]

const PASOS = [
  { n: '01', titulo: 'Tu cliente entra a tu tienda', desc: 'Navega tus productos por categorías, tallas y colores. Encuentra fotos, precios y detalles claros sin preguntarte nada.', tag: 'Experiencia simple', color: V, bg: VL },
  { n: '02', titulo: 'Elige y agrega al carrito', desc: 'Revisa cantidades y ve el total antes de confirmar. Una experiencia más rápida y cómoda desde el celular.', tag: 'Carrito automático', color: J, bg: JL },
  { n: '03', titulo: 'Recibes el pedido organizado', desc: 'Todo llega directo a tu WhatsApp: productos, cantidades y datos del cliente. Sin perder nada en el chat.', tag: 'Sin caos en el chat', color: V, bg: VL },
  { n: '04', titulo: 'Gestionas desde tu panel', desc: 'Desde tu celular revisas pedidos, actualizas estados y administras productos. Sin conocimientos técnicos.', tag: 'Panel simple', color: J, bg: JL },
  { n: '05', titulo: 'Tus clientes hacen seguimiento solos', desc: 'Cada cliente consulta el estado de su pedido con su número de orden. Menos preguntas repetidas.', tag: 'Rastreo propio', color: V, bg: VL },
]

const PLANES = [
  {
    nombre: 'Básico',
    precio: 69,
    descripcion: 'Para empezar a vender online sin complicarse.',
    cta: 'Quiero el Plan Básico',
    waText: 'Hola! Me interesa el Plan Básico de peshoop (S/69/mes) para crear mi tienda online. ¿Podemos hablar? 🛍️',
    destacado: false,
    features: [
      'Diseño personalizado con tu identidad',
      'Catálogo ilimitado de productos',
      'Pedidos directos por WhatsApp',
      'Panel de control simple e intuitivo',
      'Rastreo de pedidos para tus clientes',
      'Demo de prueba antes de lanzar',
      'Soporte y asesoramiento incluido',
    ],
    noIncluye: ['Cobro con tarjeta (Visa/Mastercard)', 'Yape integrado'],
  },
  {
    nombre: 'Pro',
    precio: 99,
    descripcion: 'Para negocios que quieren vender automáticamente.',
    cta: 'Quiero el Plan Pro',
    waText: 'Hola! Me interesa el Plan Pro de peshoop (S/99/mes) con cobro con tarjeta y Yape. ¿Podemos hablar? 🚀',
    destacado: true,
    features: [
      'Todo lo del Plan Básico',
      'Cobro con tarjeta (Visa/Mastercard)',
      'Yape integrado',
      'Pasarela Culqi certificada PCI-DSS',
      'Confirmación automática del pedido',
      'Email de confirmación al cliente',
      'Soporte prioritario',
    ],
    noIncluye: [],
  },
]

const PROCESO = [
  { n: '01', titulo: 'Creamos una demo gratis', desc: 'Antes de pagar, construimos una primera versión de tu tienda. La ves funcionando y decides.' },
  { n: '02', titulo: 'La adaptamos a tu estilo', desc: 'Revisamos juntos diseño, categorías y colores. Hacemos cambios hasta que estés conforme.' },
  { n: '03', titulo: 'Aprendes a manejar tu tienda', desc: 'Te mostramos cómo gestionar pedidos, actualizar productos y usar tu panel. Capacitación incluida.' },
  { n: '04', titulo: 'Pagas cuando estés listo', desc: 'Primero ves tu tienda funcionando y haces tus ajustes. El primer pago ocurre cuando estás conforme.' },
  { n: '05', titulo: 'Lanzamiento acompañado', desc: 'Tu tienda sale al aire. Te avisamos, te acompañamos el primer día y quedamos atentos.' },
]

const COMPARACION = [
  { label: 'Costo',          shopify: 'Mensual + comisiones', propio: 'Mayor inversión',      peshoop: 'Desde S/69/mes' },
  { label: 'Soporte',        shopify: 'Ayuda externa',        propio: 'Pagas extra o nada',   peshoop: 'Español, directo' },
  { label: 'Configuración',  shopify: 'Tú aprendes solo',     propio: 'Semanas o meses',      peshoop: 'Nosotros lo hacemos' },
  { label: 'Si creces',      shopify: 'Sube el plan solo',    propio: 'Rediseño = más costo', peshoop: 'Te acompañamos' },
]

export function PlatformLanding() {
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola! Quiero crear mi tienda online con peshoop 🛍️')}`
  const liUrl = 'https://linkedin.com/in/luis-romero-frontend'

  return (
    <main style={{ backgroundColor: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #EDE9F4' }}
        className="sticky top-0 z-30 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="font-bold text-xl tracking-tight shrink-0 select-none">
            <span style={{ color: V }}>pe</span><span style={{ color: J }}>shoop</span>
          </a>

          {/* Links secciones — solo desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ color: '#6B6080' }}>
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA desktop + hamburger mobile */}
          <div className="flex items-center gap-2">
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: V, color: '#fff' }}>
              <IconBrandWhatsapp size={16} />
              Crear mi tienda
            </a>
            <MobileMenu waUrl={waUrl} />
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="font-bold leading-tight mb-5"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.75rem)', color: TEXT, letterSpacing: '-0.02em' }}>
          Tu tienda online lista{' '}
          <span style={{ color: J }}>en un día</span>
        </h1>
        <p className="text-lg leading-relaxed mb-3 max-w-xl mx-auto" style={{ color: '#6B6080' }}>
          Crea tu catálogo, recibe pedidos por WhatsApp y cobra con tarjeta.
          Sin complicaciones. <strong style={{ color: TEXT }}>Desde S/69/mes.</strong>
        </p>
        <div className="mb-10" />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: V, color: '#fff' }}>
            <IconBrandWhatsapp size={18} />
            Crear mi tienda gratis
          </a>
          <a href="#planes"
            className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm border transition-colors hover:border-gray-300"
            style={{ color: TEXT, backgroundColor: '#fff', borderColor: '#DDD6F0' }}>
            Ver planes
          </a>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: '#9C8FB0' }}>
          {['✓ Demo gratis antes de pagar', '✓ Setup completo incluido', '✓ Soporte en español', '✓ Lanzamiento en 48 h'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── PROBLEMA ── */}
      <section id="problema" style={{ backgroundColor: '#fff' }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: V }}>El problema</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: TEXT, letterSpacing: '-0.01em' }}>
              ¿Te pasa esto todos los días?
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: '#6B6080' }}>
              Si vendes por Instagram, WhatsApp o haces lives, probablemente esto te suena:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROBLEMAS.map((p) => (
              <div key={p.titulo} className="flex gap-4 p-5 rounded-2xl border" style={{ borderColor: '#EDE9F4', backgroundColor: BG }}>
                <span className="text-2xl shrink-0 mt-0.5">{p.icon}</span>
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: TEXT }}>{p.titulo}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#6B6080' }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-5 rounded-2xl text-center" style={{ backgroundColor: JL, border: `1px solid ${J}30` }}>
            <p className="text-sm font-semibold" style={{ color: TEXT }}>
              La buena noticia: no necesitas una plataforma gigante.
            </p>
            <p className="text-xs mt-1" style={{ color: '#4A7A70' }}>
              Necesitas una tienda creada para tu forma de vender, adaptada a tu negocio y lista para crecer.
            </p>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="py-20" style={{ backgroundColor: BG }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: J }}>Cómo funciona</p>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: TEXT, letterSpacing: '-0.01em' }}>
              5 pasos para vender sin complicarte
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {PASOS.map((paso) => (
              <div key={paso.n} className="flex gap-5 p-5 rounded-2xl border bg-white items-start"
                style={{ borderColor: '#EDE9F4' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                  style={{ backgroundColor: paso.bg, color: paso.color }}>
                  {paso.n}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1" style={{ color: TEXT }}>{paso.titulo}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#6B6080' }}>{paso.desc}</p>
                </div>
                <span className="hidden sm:inline-flex shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: paso.bg, color: paso.color }}>
                  {paso.tag}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ color: V }}>
              Quiero ver mi tienda <IconArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ── PLANES ── */}
      <section id="planes" style={{ backgroundColor: '#fff' }} className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: V }}>Planes</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: TEXT, letterSpacing: '-0.01em' }}>
              Empieza simple. Crece cuando estés listo.
            </h2>
            <p className="text-sm" style={{ color: '#6B6080' }}>7 días gratis · Sin tarjeta · Sin letra chica</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PLANES.map((plan) => (
              <div key={plan.nombre} className="rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  backgroundColor: plan.destacado ? V : BG,
                  color: plan.destacado ? '#fff' : TEXT,
                  border: plan.destacado ? 'none' : '1px solid #EDE9F4',
                  boxShadow: plan.destacado ? `0 8px 32px ${V}30` : 'none',
                }}>
                {plan.destacado && (
                  <span className="self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                    ★ Más popular
                  </span>
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: plan.destacado ? 'rgba(255,255,255,0.6)' : '#9C8FB0' }}>
                    Plan {plan.nombre}
                  </p>
                  <p className="font-bold" style={{ fontSize: '2.25rem', letterSpacing: '-0.02em' }}>
                    S/{plan.precio}
                    <span className="text-sm font-normal"
                      style={{ color: plan.destacado ? 'rgba(255,255,255,0.6)' : '#9C8FB0' }}>/mes</span>
                  </p>
                  <p className="text-sm mt-1"
                    style={{ color: plan.destacado ? 'rgba(255,255,255,0.75)' : '#6B6080' }}>
                    {plan.descripcion}
                  </p>
                </div>
                <ul className="flex flex-col gap-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <IconCheck size={14} className="mt-0.5 shrink-0" style={{ color: plan.destacado ? JL : J }} />
                      <span>{f}</span>
                    </li>
                  ))}
                  {plan.noIncluye.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm"
                      style={{ color: plan.destacado ? 'rgba(255,255,255,0.35)' : '#BDB5CC' }}>
                      <IconX size={14} className="mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(plan.waText)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-full text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: plan.destacado ? '#fff' : V, color: plan.destacado ? V : '#fff' }}>
                  <IconBrandWhatsapp size={16} />
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl p-5 border" style={{ borderColor: '#EDE9F4', backgroundColor: BG }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9C8FB0' }}>
              Servicios adicionales (opcionales)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '🌐', titulo: 'Dominio propio', desc: 'tumarca.com / tumarca.pe — más confianza y profesionalismo.' },
                { icon: '📧', titulo: 'Correo corporativo', desc: 'ventas@tumarca.com — deja de usar correos personales.' },
                { icon: '💳', titulo: 'Pagos Culqi', desc: 'Yape + tarjeta débito/crédito. Solo necesitas RUC.' },
              ].map((s) => (
                <div key={s.titulo} className="flex gap-3">
                  <span className="text-xl shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: TEXT }}>{s.titulo}</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#6B6080' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EL PROCESO ── */}
      <section id="proceso" className="py-20" style={{ backgroundColor: BG }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: J }}>El proceso</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: TEXT, letterSpacing: '-0.01em' }}>
              De la idea a tu tienda en pocos pasos
            </h2>
            <p className="text-sm" style={{ color: '#6B6080' }}>
              Te acompañamos desde el primer día hasta el lanzamiento.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROCESO.map((p, i) => (
              <div key={p.n} className="p-5 rounded-2xl border bg-white" style={{ borderColor: '#EDE9F4' }}>
                <span className="inline-block text-xs font-bold mb-3 px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: i % 2 === 0 ? VL : JL, color: i % 2 === 0 ? V : J }}>
                  Paso {p.n}
                </span>
                <p className="font-semibold text-sm mb-1" style={{ color: TEXT }}>{p.titulo}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#6B6080' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARACIÓN ── */}
      <section style={{ backgroundColor: '#fff' }} className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: V }}>Comparación</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: TEXT, letterSpacing: '-0.01em' }}>
              ¿Por qué elegir peshoop?
            </h2>
            <p className="text-sm" style={{ color: '#6B6080' }}>
              Diseñado para emprendedores peruanos, no para grandes empresas.
            </p>
          </div>

          {/* Cards por atributo — funciona perfecto en mobile */}
          <div className="flex flex-col gap-3">
            {COMPARACION.map((row) => (
              <div key={row.label} className="rounded-2xl border overflow-hidden" style={{ borderColor: '#EDE9F4' }}>
                {/* Título del atributo */}
                <div className="px-4 py-2.5 border-b" style={{ borderColor: '#EDE9F4', backgroundColor: BG }}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9C8FB0' }}>{row.label}</p>
                </div>
                {/* 3 opciones en fila */}
                <div className="grid grid-cols-3">
                  {/* Shopify */}
                  <div className="px-3 py-4 border-r" style={{ borderColor: '#EDE9F4' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#C4BBC8' }}>Shopify</p>
                    <p className="text-xs leading-snug" style={{ color: '#9C8FB0' }}>{row.shopify}</p>
                  </div>
                  {/* Desarrollo */}
                  <div className="px-3 py-4 border-r" style={{ borderColor: '#EDE9F4' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#C4BBC8' }}>Desarrollo</p>
                    <p className="text-xs leading-snug" style={{ color: '#9C8FB0' }}>{row.propio}</p>
                  </div>
                  {/* peshoop — destacado */}
                  <div className="px-3 py-4" style={{ backgroundColor: VL }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: V }}>peshoop ✓</p>
                    <p className="text-xs font-semibold leading-snug" style={{ color: V }}>{row.peshoop}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUIÉNES SOMOS ── */}
      <section id="nosotros" className="py-20" style={{ backgroundColor: BG }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: J }}>Quiénes somos</p>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: TEXT, letterSpacing: '-0.01em' }}>
              Construimos contigo, no solo para ti
            </h2>
          </div>

          {/* Tarjeta principal — 2 col desktop, 1 col mobile */}
          <div className="bg-white rounded-3xl border overflow-hidden flex flex-col lg:flex-row"
            style={{ borderColor: '#EDE9F4', boxShadow: '0 4px 32px rgba(108,43,217,0.07)' }}>

            {/* Columna imagen */}
            <div className="flex-shrink-0 flex items-center justify-center p-8 lg:p-10"
              style={{ backgroundColor: VL, minWidth: 0 }}>
              <div className="relative">
                {/* Aro violeta decorativo */}
                <div className="absolute inset-0 rounded-full"
                  style={{ boxShadow: `0 0 0 6px ${VL}, 0 0 0 10px ${V}30` }} />
                <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-52 lg:h-52 rounded-full overflow-hidden relative"
                  style={{ border: `4px solid #fff`, boxShadow: '0 8px 24px rgba(108,43,217,0.18)' }}>
                  <Image
                    src="/luis-romero.jpg"
                    alt="Luis Romero — Fundador de Peshoop"
                    width={208}
                    height={208}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Badge "Fundador" */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ backgroundColor: V, color: '#fff', boxShadow: '0 2px 8px rgba(108,43,217,0.35)' }}>
                  Fundador
                </div>
              </div>
            </div>

            {/* Columna texto */}
            <div className="flex-1 px-6 sm:px-8 lg:px-10 py-8 flex flex-col justify-center gap-5">
              {/* Nombre y cargo */}
              <div>
                <h3 className="font-bold text-2xl" style={{ color: TEXT }}>Luis Romero</h3>
                <p className="text-sm mt-1" style={{ color: '#9C8FB0' }}>
                  6 años construyendo plataformas digitales en Perú
                </p>
              </div>

              {/* Highlights */}
              <ul className="flex flex-col gap-3">
                {[
                  'Trabajé en proyectos digitales para Pacífico Seguros, UPC, UPN, Cibertec y Claro Perú.',
                  'Yo creo, configuro y lanzo tu tienda. Tú solo te enfocas en vender.',
                  'Acompañamos antes, durante y después — no desaparecemos al entregar.',
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-sm items-start">
                    <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: JL }}>
                      <IconCheck size={11} style={{ color: J }} />
                    </span>
                    <span style={{ color: '#6B6080' }}>{t}</span>
                  </li>
                ))}
              </ul>

              {/* Transparencia */}
              <div className="p-4 rounded-2xl text-xs leading-relaxed" style={{ backgroundColor: VL, color: V }}>
                <strong>Sin letra chica:</strong> Si los planes cambian, siempre avisamos con anticipación. Sin cobros sorpresa.
              </div>

              {/* LinkedIn */}
              <div>
                <a href={liUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#0A66C2', color: '#fff' }}>
                  <IconBrandLinkedin size={16} />
                  Ver LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20" style={{ backgroundColor: V }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Sin compromiso
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#fff', letterSpacing: '-0.01em' }}>
            Escríbenos y creamos tu demo gratis
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Primero ves tu tienda funcionando. Pagas cuando estés listo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#fff', color: V }}>
              <IconBrandWhatsapp size={18} />
              Escribir por WhatsApp
            </a>
            <a href="#planes"
              className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm border transition-colors"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)' }}>
              Ver planes
            </a>
          </div>
          <p className="mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            WA: 982 121 991 · peshoop.com
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-5 text-center text-xs border-t" style={{ backgroundColor: '#fff', borderColor: '#EDE9F4', color: '#9C8FB0' }}>
        <span className="font-bold" style={{ color: V }}>pe</span>
        <span className="font-bold" style={{ color: J }}>shoop</span>
        <span className="mx-2">·</span>
        © {new Date().getFullYear()} Peshoop · Tiendas online para negocios peruanos
      </footer>

    </main>
  )
}
