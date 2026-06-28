import Link from 'next/link'
import { IconArrowLeft, IconFileText } from '@tabler/icons-react'
import { createAdminClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant()
  const nombre = tenant.nombre || 'Mi Tienda'
  return {
    title: 'Términos y Condiciones',
    description: `Términos y condiciones de compra de ${nombre}. Política de envíos, devoluciones y garantías.`,
    alternates: { canonical: '/terminos-y-condiciones' },
    robots: { index: true, follow: false },
  }
}

export default async function TerminosPage() {
  const tenant = await getTenant()
  const admin = createAdminClient()
  const [{ data: ct }, { data: cf }] = await Promise.all([
    admin.from('config_tienda').select('tienda_nombre, empresa_razon, empresa_ruc, empresa_dir, whatsapp_numero').eq('tenant_id', tenant.id).single(),
    admin.from('config_footer').select('email').eq('tenant_id', tenant.id).single(),
  ])

  const tiendaNombre = ct?.tienda_nombre ?? tenant.nombre
  const razonSocial  = ct?.empresa_razon || tiendaNombre
  const ruc          = ct?.empresa_ruc ?? ''
  const direccion    = ct?.empresa_dir  ?? ''
  const whatsapp     = ct?.whatsapp_numero ?? ''
  const email        = cf?.email ?? ''

  const hoy = new Date()
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const fecha = `${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">

      {/* Header */}
      <div className="backdrop-blur border-b px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 95%, transparent)', borderColor: 'var(--color-border)' }}>
        <Link href="/"
          className="p-1.5 rounded-full hover:bg-[var(--color-surface)] transition-colors text-[var(--color-muted)]">
          <IconArrowLeft size={18} />
        </Link>
        <p className="font-bold text-[var(--color-ink)] text-sm">Términos y condiciones</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Intro */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-brand-bg)' }}>
            <IconFileText size={22} style={{ color: 'var(--color-brand)' }} />
          </div>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            Al realizar una compra en {tiendaNombre} aceptas los siguientes términos y condiciones.
            Te recomendamos leerlos antes de completar tu pedido.
          </p>
        </div>

        <div className="border rounded-2xl p-5 flex flex-col gap-5 text-sm leading-relaxed"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-ink)' }}>

          <section>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
              1. Cómo funciona la compra
            </p>
            <p>
              El proceso de compra en {tiendaNombre} consta de los siguientes pasos: (1) eliges tus
              productos y los agregas al carrito, (2) ingresas tus datos de contacto y dirección de
              entrega, (3) seleccionas tu método de pago y confirmas la compra, y (4) recibes una
              confirmación con el número de tu pedido. Desde ese momento puedes rastrear el estado
              de tu pedido desde la sección &quot;Rastrear pedido&quot; usando tu código y número de celular.
            </p>
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
              2. Métodos de pago
            </p>
            <p>
              Aceptamos pagos con tarjetas de crédito y débito (Visa, Mastercard) y Yape, procesados
              de forma segura a través de Culqi, una pasarela de pagos certificada PCI-DSS.
              {tiendaNombre} no almacena los datos de tu tarjeta en ningún momento. El pedido se
              confirma automáticamente una vez que el pago es aprobado.
            </p>
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
              3. Tiempos de entrega
            </p>
            <p>
              Los tiempos de entrega varían según tu ubicación y la disponibilidad del producto.
              En general, los pedidos se procesan y despachan dentro de las 24-48 horas posteriores
              a la confirmación del pago, y la entrega puede tomar entre 1 y 7 días hábiles dependiendo
              del destino. Te mantendremos informado sobre el estado de tu pedido a través de
              {whatsapp ? ' WhatsApp y' : ''} el correo registrado, y podrás consultarlo en cualquier
              momento desde &quot;Rastrear pedido&quot;.
            </p>
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
              4. Responsabilidad del vendedor
            </p>
            <p>
              {razonSocial}{ruc ? ` (RUC ${ruc})` : ''} es responsable de la calidad de los productos
              ofrecidos, de la veracidad de la información publicada en el catálogo y de gestionar el
              envío de los pedidos confirmados. En caso de fallas atribuibles al vendedor (producto
              dañado, incompleto o distinto al solicitado), el cliente tiene derecho a solicitar el
              cambio, devolución o reembolso correspondiente, conforme a la política de cambios y
              devoluciones vigente. {tiendaNombre} no se hace responsable por demoras ocasionadas por
              causas ajenas a su control, como huelgas, desastres naturales o fallas de las empresas
              de transporte.
            </p>
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
              5. Uso de la plataforma
            </p>
            <p>
              Al usar este sitio te comprometes a proporcionar información veraz y actualizada, y a
              utilizar la plataforma únicamente para fines lícitos relacionados con la compra de
              productos. Todo el contenido del sitio (textos, imágenes, marca y diseño) es propiedad
              de {tiendaNombre} y no puede ser reproducido sin autorización.
              {tiendaNombre} se reserva el derecho de actualizar estos términos en cualquier momento;
              los cambios serán publicados en esta misma página.
            </p>
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
              6. Reclamos
            </p>
            <p>
              Si tienes una queja o reclamo sobre tu compra, puedes registrarlo en nuestro{' '}
              <Link href="/libro-de-reclamaciones" className="underline" style={{ color: 'var(--color-ink)' }}>
                Libro de Reclamaciones
              </Link>, conforme al Código de Protección y Defensa del Consumidor.
            </p>
          </section>

          {(whatsapp || email) && (
            <section>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
                7. Contacto
              </p>
              <p>
                {direccion && <>{direccion}<br /></>}
                {email && <>Email: {email}<br /></>}
                {whatsapp && <>WhatsApp: +{whatsapp}</>}
              </p>
            </section>
          )}

          <p className="text-xs pt-2 border-t" style={{ color: 'var(--color-muted)', borderColor: 'var(--color-border)' }}>
            Última actualización: {fecha}
          </p>
        </div>
      </div>
    </main>
  )
}

