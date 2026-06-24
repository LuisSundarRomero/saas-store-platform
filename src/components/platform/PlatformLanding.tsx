import Link from 'next/link'
import { IconCheck, IconBrandWhatsapp, IconCreditCard, IconShoppingBag, IconChartBar, IconTruckDelivery } from '@tabler/icons-react'

const WHATSAPP = '51999999999' // reemplazar con número real del SaaS owner

const PLANES = [
  {
    nombre: 'Básico',
    precio: 69,
    descripcion: 'Para empezar a vender hoy.',
    cta: 'Empezar gratis 7 días',
    destacado: false,
    features: [
      'Tienda online en tu propio subdominio',
      'Catálogo ilimitado de productos',
      'Carrito de compras',
      'Checkout por WhatsApp',
      'Gestión de pedidos',
      'Rastreo de pedidos para tus clientes',
      'Página admin completa',
    ],
    noIncluye: [
      'Cobro con tarjeta (Visa/Mastercard)',
      'Yape integrado',
    ],
  },
  {
    nombre: 'Pro',
    precio: 99,
    descripcion: 'Más ventas, menos fricción.',
    cta: 'Empezar gratis 7 días',
    destacado: true,
    features: [
      'Todo lo del Plan Básico',
      'Cobro con tarjeta (Visa/Mastercard)',
      'Yape integrado',
      'Pasarela Culqi certificada PCI-DSS',
      'Confirmación automática del pedido',
      'Email de confirmación al cliente',
    ],
    noIncluye: [],
  },
]

const FEATURES = [
  {
    icon: IconShoppingBag,
    titulo: 'Tu tienda en minutos',
    desc: 'Sube tus productos, configura tu tienda y comparte el link. Sin código, sin diseñador.',
  },
  {
    icon: IconBrandWhatsapp,
    titulo: 'WhatsApp nativo',
    desc: 'Los pedidos llegan directo a tu WhatsApp con el resumen listo. Sin apps extra.',
  },
  {
    icon: IconCreditCard,
    titulo: 'Cobros con tarjeta',
    desc: 'Plan Pro incluye Visa, Mastercard y Yape. El dinero va directo a tu cuenta Culqi.',
  },
  {
    icon: IconTruckDelivery,
    titulo: 'Tracking de pedidos',
    desc: 'Tus clientes rastrean su pedido con su código. Tú actualizas el estado desde el admin.',
  },
  {
    icon: IconChartBar,
    titulo: 'Admin completo',
    desc: 'Gestiona productos, categorías, pedidos y configuración desde un panel limpio.',
  },
]

export function PlatformLanding() {
  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola! Quiero crear mi tienda online 🛍️')}`

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0e0e10', color: '#F5F5F2' }}>

      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-bold text-lg tracking-tight">contahorro</span>
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="text-sm font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#E11D2E', color: '#fff' }}>
          Contactar
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
          style={{ backgroundColor: '#1a0a0c', color: '#E11D2E' }}>
          Plataforma SaaS · Tiendas de ropa online
        </span>
        <h1 className="font-bold leading-tight mb-6" style={{ fontSize: 'clamp(2.2rem, 7vw, 4rem)' }}>
          Tu tienda online lista{' '}
          <span style={{ color: '#E11D2E' }}>en un día</span>
        </h1>
        <p className="text-lg leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: '#9A9A9E' }}>
          Crea tu catálogo, recibe pedidos por WhatsApp y cobra con tarjeta.
          Sin complicaciones. Desde S/69/mes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#E11D2E', color: '#fff' }}>
            <IconBrandWhatsapp size={18} />
            Crear mi tienda
          </a>
          <a href="#planes"
            className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-full text-sm border border-white/20 hover:border-white/40 transition-colors"
            style={{ color: '#F5F5F2' }}>
            Ver planes
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.titulo} className="rounded-2xl p-5 border border-white/8"
              style={{ backgroundColor: '#161618' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: '#1a0a0c' }}>
                <f.icon size={20} style={{ color: '#E11D2E' }} />
              </div>
              <p className="font-semibold mb-1 text-sm">{f.titulo}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#9A9A9E' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-2">Planes</h2>
        <p className="text-center text-sm mb-10" style={{ color: '#9A9A9E' }}>
          7 días gratis. Sin tarjeta. Cancela cuando quieras.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PLANES.map((plan) => (
            <div key={plan.nombre}
              className="rounded-2xl p-6 border flex flex-col gap-4"
              style={{
                backgroundColor: plan.destacado ? '#1a0a0c' : '#161618',
                borderColor: plan.destacado ? '#E11D2E' : 'rgba(255,255,255,0.08)',
              }}>
              {plan.destacado && (
                <span className="self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: '#E11D2E', color: '#fff' }}>
                  Recomendado
                </span>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#9A9A9E' }}>
                  Plan {plan.nombre}
                </p>
                <p className="font-bold" style={{ fontSize: '2rem' }}>
                  S/{plan.precio}
                  <span className="text-sm font-normal" style={{ color: '#9A9A9E' }}>/mes</span>
                </p>
                <p className="text-sm mt-1" style={{ color: '#9A9A9E' }}>{plan.descripcion}</p>
              </div>
              <ul className="flex flex-col gap-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <IconCheck size={15} className="mt-0.5 shrink-0" style={{ color: '#E11D2E' }} />
                    <span>{f}</span>
                  </li>
                ))}
                {plan.noIncluye.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#6B6B70' }}>
                    <span className="mt-0.5 shrink-0 text-base leading-none">—</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-full text-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: plan.destacado ? '#E11D2E' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                }}>
                <IconBrandWhatsapp size={16} />
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-3">¿Tienes alguna duda?</h2>
        <p className="text-sm mb-8" style={{ color: '#9A9A9E' }}>
          Escríbenos por WhatsApp. Te respondemos en minutos y configuramos tu tienda contigo.
        </p>
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-full text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#E11D2E', color: '#fff' }}>
          <IconBrandWhatsapp size={18} />
          Hablar por WhatsApp
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs"
        style={{ color: '#6B6B70' }}>
        © {new Date().getFullYear()} Contahorro · Plataforma SaaS de tiendas online en Perú
      </footer>

    </main>
  )
}
