import Image from 'next/image'
import {
  IconCheck, IconBrandWhatsapp, IconX,
  IconArrowRight, IconBrandLinkedin,
} from '@tabler/icons-react'
import { NavBar } from './NavBar'
import { Wordmark } from './Wordmark'

const WHATSAPP = '51982121991'


const PROBLEMAS = [
  { icon: '😟', titulo: 'Pierdes ventas cuando no estás', desc: 'Tus clientes quieren comprar en cualquier momento. Si terminó tu live o no respondes rápido, pierdes la venta.' },
  { icon: '💬', titulo: 'Pedidos perdidos entre mensajes', desc: 'Fotos, precios, tallas y direcciones mezcladas en un mismo chat. Organizar todo se convierte en caos.' },
  { icon: '📊', titulo: 'No sabes cuánto vendiste', desc: 'Sin una herramienta que te ayude, controlar ventas e inventario te roba tiempo que podrías usar para crecer.' },
  { icon: '🔄', titulo: 'Respondes lo mismo todos los días', desc: '¿Tienes talla M? ¿Llegó mi pedido? Mientras respondes, podrías estar buscando nuevos clientes.' },
]

const PASOS = [
  { n: '01', titulo: 'Tu cliente entra a tu tienda', desc: 'Navega tus productos por categorías, tallas y colores. Encuentra fotos, precios y detalles claros sin preguntarte nada.', tag: 'Experiencia simple', circleClass: 'pl-step-circle-v', badgeClass: 'pl-badge-v' },
  { n: '02', titulo: 'Elige y agrega al carrito', desc: 'Revisa cantidades y ve el total antes de confirmar. Una experiencia más rápida y cómoda desde el celular.', tag: 'Carrito automático', circleClass: 'pl-step-circle-j', badgeClass: 'pl-badge-j' },
  { n: '03', titulo: 'Recibes el pedido organizado', desc: 'Todo llega directo a tu WhatsApp: productos, cantidades y datos del cliente. Sin perder nada en el chat.', tag: 'Sin caos en el chat', circleClass: 'pl-step-circle-v', badgeClass: 'pl-badge-v' },
  { n: '04', titulo: 'Gestionas desde tu panel', desc: 'Desde tu celular revisas pedidos, actualizas estados y administras productos. Sin conocimientos técnicos.', tag: 'Panel simple', circleClass: 'pl-step-circle-j', badgeClass: 'pl-badge-j' },
  { n: '05', titulo: 'Tus clientes hacen seguimiento solos', desc: 'Cada cliente consulta el estado de su pedido con su número de orden. Menos preguntas repetidas.', tag: 'Rastreo propio', circleClass: 'pl-step-circle-v', badgeClass: 'pl-badge-v' },
]

const PLANES = [
  {
    nombre: 'Básico',
    precio: 69,
    descripcion: 'Para empezar a vender online sin complicarse.',
    cta: 'Quiero el Plan Básico',
    waText: 'Hola! Me interesa el Plan Básico de peshoop (S/69/mes) para crear mi tienda online. ¿Podemos hablar? 🛍️',
    destacado: false,
    nota: '',
    features: [
      'Lista en un día',
      'Diseño personalizado con tu identidad',
      'Catálogo ilimitado de productos',
      'Pedidos directos por WhatsApp',
      'Panel de control simple e intuitivo',
      'Rastreo de pedidos para tus clientes',
      'Demo de prueba antes de lanzar',
      'Soporte y asesoramiento incluido',
    ],
    noIncluye: [],
  },
  {
    nombre: 'Pro',
    precio: 99,
    descripcion: 'Para negocios que quieren vender automáticamente.',
    cta: 'Quiero el Plan Pro',
    waText: 'Hola! Me interesa el Plan Pro de peshoop (S/99/mes) con cobro con tarjeta y Yape. ¿Podemos hablar? 🚀',
    destacado: true,
    nota: 'Requiere RUC para configurar Culqi. Te guiamos en el proceso.',
    features: [
      'Todo lo del Plan Básico',
      'Cobro con tarjeta (Visa/Mastercard)',
      'Yape integrado',
      'Pasarela Culqi certificada PCI-DSS',
      'Confirmación automática del pedido',
      'Soporte prioritario',
    ],
    noIncluye: [],
  },
]

const PROCESO = [
  { n: '01', titulo: 'Creamos tú demo', desc: 'Antes de pagar, construimos una primera versión de tu tienda. La ves funcionando y decides.', badgeClass: 'pl-badge-v' },
  { n: '02', titulo: 'La adaptamos a tu estilo', desc: 'Revisamos juntos diseño, categorías y colores. Hacemos cambios hasta que estés conforme.', badgeClass: 'pl-badge-j' },
  { n: '03', titulo: 'Aprendes a manejar tu tienda', desc: 'Te mostramos cómo gestionar pedidos, actualizar productos y usar tu panel. Capacitación incluida.', badgeClass: 'pl-badge-v' },
  { n: '04', titulo: 'Pagas cuando estés listo', desc: 'Primero ves tu tienda funcionando y haces tus ajustes. El primer pago ocurre cuando estás conforme.', badgeClass: 'pl-badge-j' },
  { n: '05', titulo: 'Lanzamiento acompañado', desc: 'Tu tienda sale al aire. Te avisamos, te acompañamos el primer día y quedamos atentos.', badgeClass: 'pl-badge-v' },
]

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://peshoop.com'

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${APP_URL}/#organization`,
      name: 'Peshoop',
      url: APP_URL,
      logo: { '@type': 'ImageObject', url: `${APP_URL}/favicon-96x96.png` },
      contactPoint: { '@type': 'ContactPoint', contactType: 'sales', telephone: '+51982121991', availableLanguage: 'Spanish' },
      sameAs: ['https://linkedin.com/in/luis-romero-frontend'],
    },
    {
      '@type': 'WebSite',
      '@id': `${APP_URL}/#website`,
      url: APP_URL,
      name: 'Peshoop',
      publisher: { '@id': `${APP_URL}/#organization` },
      inLanguage: 'es-PE',
    },
    {
      '@type': 'Person',
      '@id': `${APP_URL}/#founder`,
      name: 'Luis Romero',
      jobTitle: 'Fundador',
      worksFor: { '@id': `${APP_URL}/#organization` },
      sameAs: ['https://linkedin.com/in/luis-romero-frontend'],
      image: `${APP_URL}/luis-romero.jpg`,
    },
    {
      '@type': 'WebPage',
      '@id': `${APP_URL}/#webpage`,
      url: APP_URL,
      name: 'Peshoop — Tu tienda online lista para vender',
      description: 'Crea tu tienda online para ropa en minutos. Recibe pedidos por WhatsApp y cobra con tarjeta. Desde S/69/mes. Para negocios peruanos.',
      isPartOf: { '@id': `${APP_URL}/#website` },
      about: { '@id': `${APP_URL}/#organization` },
      inLanguage: 'es-PE',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${APP_URL}/#app`,
      name: 'Peshoop',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: [
        { '@type': 'Offer', name: 'Plan Básico', price: '69', priceCurrency: 'PEN', billingIncrement: 'monthly' },
        { '@type': 'Offer', name: 'Plan Pro',    price: '99', priceCurrency: 'PEN', billingIncrement: 'monthly' },
      ],
    },
  ],
}

export function PlatformLanding() {
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola! Quiero crear mi tienda online con peshoop 🛍️')}`
  const liUrl = 'https://linkedin.com/in/luis-romero-frontend'

  return (
    <>
      {/* Preconnects para recursos externos */}
      <link rel="preconnect" href="https://wa.me" />
      <link rel="dns-prefetch" href="https://wa.me" />

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

    <main className="bg-pbg text-ptxt font-jakarta pt-16">

      <NavBar waUrl={waUrl} />

      {/* ── HERO ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="font-comfortaa font-bold leading-tight mb-5 text-ptxt"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.75rem)', letterSpacing: '-0.02em' }}>
          Tu tienda online{' '}
          <span className="text-pj">lista para vender</span>
        </h1>
        <p className="text-lg leading-relaxed mb-3 max-w-xl mx-auto text-pmuted">
          Crea tu catálogo, recibe pedidos por WhatsApp y cobra con tarjeta.
          Sin complicaciones. <strong className="text-ptxt">Desde S/69/mes.</strong>
        </p>
        <div className="mb-10" />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#00A389' }}>
            <IconBrandWhatsapp size={18} />
            Crear mi tienda
          </a>
          <a href="#planes"
            className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm border transition-colors hover:bg-pvl bg-white text-pv" style={{ borderColor: '#C4A8F0' }}>
            Ver planes
          </a>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-pmuted2">
          {['✓ Demo gratis antes de pagar', '✓ Soporte en español'].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── PROBLEMA ── */}
      <section id="problema" className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-ptxt" style={{ letterSpacing: '-0.01em' }}>
              ¿Te pasa esto todos los días?
            </h2>
            <p className="text-sm max-w-lg mx-auto text-pmuted">
              Si vendes por Instagram, WhatsApp o haces lives, probablemente esto te suena:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROBLEMAS.map((p) => (
              <div key={p.titulo} className="flex gap-4 p-5 rounded-2xl border border-pborder bg-pbg">
                <span className="text-2xl shrink-0 mt-0.5">{p.icon}</span>
                <div>
                  <p className="font-semibold text-sm mb-1 text-ptxt">{p.titulo}</p>
                  <p className="text-xs leading-relaxed text-pmuted">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-5 rounded-2xl text-center bg-pjl border border-pj/20">
            <p className="text-sm font-semibold text-ptxt">
              La buena noticia: no necesitas una plataforma gigante.
            </p>
            <p className="text-xs mt-1" style={{ color: '#4A7A70' }}>
              Necesitas una tienda creada para tu forma de vender, adaptada a tu negocio y lista para crecer.
            </p>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="py-20 bg-pbg">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-ptxt" style={{ letterSpacing: '-0.01em' }}>
              5 pasos para vender sin complicarte
            </h2>
          </div>
          <div className="flex flex-col">
            {PASOS.map((paso, i) => (
              <div key={paso.n} className="flex gap-5 sm:gap-8 relative">
                <div className="flex flex-col items-center shrink-0">
                  <div className={paso.circleClass}>{paso.n}</div>
                  {i < PASOS.length - 1 && <div className="pl-connector" />}
                </div>
                <div className={`flex-1 ${i === PASOS.length - 1 ? 'pb-0' : 'pb-8'}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <p className="font-semibold text-sm sm:text-base text-ptxt">{paso.titulo}</p>
                    <span className={`${paso.badgeClass} pl-badge`}>{paso.tag}</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed mt-1 text-pmuted">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80 text-pj">
              Quiero ver mi tienda <IconArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ── PLANES ── */}
      <section id="planes" className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-ptxt" style={{ letterSpacing: '-0.01em' }}>
              Empieza simple. Crece cuando estés listo.
            </h2>
            
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PLANES.map((plan) => (
              <div key={plan.nombre}
                className={`rounded-2xl p-6 flex flex-col gap-4 ${plan.destacado ? 'pl-plan-featured' : 'bg-pbg border border-pborder'}`}>
                {plan.destacado && (
                  <span className="self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: '#00A389' }}>
                    ★ Más popular
                  </span>
                )}
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.destacado ? 'text-white/60' : 'text-pmuted2'}`}>
                    Plan {plan.nombre}
                  </p>
                  <p className="font-bold text-[2.25rem]" style={{ letterSpacing: '-0.02em' }}>
                    S/{plan.precio}
                    <span className={`text-sm font-normal ${plan.destacado ? 'text-white/60' : 'text-pmuted2'}`}>/mes</span>
                  </p>
                  <p className={`text-sm mt-1 ${plan.destacado ? 'text-white/75' : 'text-pmuted'}`}>
                    {plan.descripcion}
                  </p>
                </div>
                <ul className="flex flex-col gap-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <IconCheck size={14} className={`mt-0.5 shrink-0 ${plan.destacado ? 'text-pjl' : 'text-pj'}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                  {plan.noIncluye.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.destacado ? 'text-white/35' : 'text-pmuted3'}`}>
                      <IconX size={14} className="mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.nota && (
                  <p className="text-xs px-1 text-white/50">{plan.nota}</p>
                )}
                <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(plan.waText)}`}
                  target="_blank" rel="noopener noreferrer"
                  className={`mt-2 inline-flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-full text-sm transition-opacity hover:opacity-90 ${plan.destacado ? 'bg-white text-pj' : 'bg-pj text-white'}`}>
                  <IconBrandWhatsapp size={16} />
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl p-5 border border-pborder bg-pbg">
            <p className="pl-section-label mb-4 text-pmuted2">Servicios adicionales (opcionales)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: '🌐', titulo: 'Dominio propio', desc: 'tumarca.com / tumarca.pe — más confianza y profesionalismo.' },
                { icon: '✉️', titulo: 'Correo corporativo', desc: 'ventas@tumarca.com — deja de usar correos personales.' },
          
              ].map((s) => (
                <div key={s.titulo} className="flex gap-3">
                  <span className="text-xl shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-xs font-semibold mb-0.5 text-ptxt">{s.titulo}</p>
                    <p className="text-xs leading-relaxed text-pmuted">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EL PROCESO ── */}
      <section id="proceso" className="py-20 bg-pbg">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-ptxt" style={{ letterSpacing: '-0.01em' }}>
              De la idea a tu tienda en pocos pasos
            </h2>
            <p className="text-sm text-pmuted">Te acompañamos desde el primer día hasta el lanzamiento.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROCESO.slice(0, 3).map((p) => (
              <div key={p.n} className="pl-card p-5">
                <span className={`${p.badgeClass} pl-badge mb-3`}>Paso {p.n}</span>
                <p className="font-semibold text-sm mb-1 text-ptxt">{p.titulo}</p>
                <p className="text-xs leading-relaxed text-pmuted">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {PROCESO.slice(3).map((p) => (
              <div key={p.n} className="pl-card p-5">
                <span className={`${p.badgeClass} pl-badge mb-3`}>Paso {p.n}</span>
                <p className="font-semibold text-sm mb-1 text-ptxt">{p.titulo}</p>
                <p className="text-xs leading-relaxed text-pmuted">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUIÉNES SOMOS ── */}
      <section id="nosotros" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">

            <h2 className="text-2xl sm:text-3xl font-bold text-ptxt" style={{ letterSpacing: '-0.01em' }}>
              Construimos contigo, no solo para ti
            </h2>
          </div>

          <div className="rounded-3xl border border-pborder overflow-hidden flex flex-col lg:flex-row bg-white">
            {/* Imagen */}
            <div className="flex-shrink-0 flex items-center justify-center p-8 lg:p-10 bg-pvl">
              <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-52 lg:h-52 rounded-full overflow-hidden border-4 border-white">
                <Image
                  src="/luis-romero.jpg"
                  alt="Luis Romero — Fundador de Peshoop"
                  width={208}
                  height={208}
                  sizes="(max-width: 640px) 192px, 208px"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Texto */}
            <div className="flex-1 px-6 sm:px-8 lg:px-10 py-8 flex flex-col justify-center gap-5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-2xl text-ptxt">Luis Romero</h3>
                  <span className="pl-badge pl-badge-v">Fundador</span>
                </div>
                <p className="text-sm mt-1 text-pmuted2">6 años construyendo plataformas digitales en Perú</p>
              </div>

              <ul className="flex flex-col gap-3">
                {[
                  'Trabajé en proyectos digitales para Pacífico Seguros, UPC, UPN, Cibertec y Claro Perú.',
                  'Yo creo, configuro y lanzo tu tienda. Tú solo te enfocas en vender.',
                  'Acompañamos antes, durante y después — no desaparecemos al entregar.',
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-sm items-start">
                    <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-pjl">
                      <IconCheck size={11} className="text-pj" />
                    </span>
                    <span className="text-pmuted">{t}</span>
                  </li>
                ))}
              </ul>

              <div className="pl-transparency-box">
                <strong>Sin letra chica:</strong> Si los planes cambian, siempre avisamos con anticipación. Sin cobros sorpresa.
              </div>

              <div>
                <a href={liUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 text-white"
                  style={{ backgroundColor: '#0A66C2' }}>
                  <IconBrandLinkedin size={16} />
                  Ver LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 bg-pv">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-white" style={{ letterSpacing: '-0.01em' }}>
            Escríbenos y creamos tú demo
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Primero ves tu tienda funcionando. Pagas cuando estés listo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm transition-opacity hover:opacity-90 bg-white text-pv">
              <IconBrandWhatsapp size={18} />
              Escribir por WhatsApp
            </a>
            <a href="#planes"
              className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm border transition-colors text-white border-white/35">
              Ver planes
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-5 text-center text-xs border-t border-pborder bg-white text-pmuted2">
        <Wordmark className="text-sm" />
        <span className="mx-2">·</span>
        © {new Date().getFullYear()} Peshoop · Tiendas online para negocios peruanos
      </footer>

    </main>
    </>
  )
}
