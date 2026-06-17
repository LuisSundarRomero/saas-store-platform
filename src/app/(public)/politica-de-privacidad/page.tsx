import Link from 'next/link'
import { IconArrowLeft, IconShieldLock } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/server'

export default async function PoliticaPrivacidadPage() {
  const supabase = await createClient()
  const { data: config } = await supabase
    .from('config')
    .select('tienda_nombre, empresa_razon_social, empresa_ruc, empresa_direccion, whatsapp_numero, footer_email')
    .single()

  const tiendaNombre = config?.tienda_nombre ?? 'Mi Tienda'
  const razonSocial = config?.empresa_razon_social || tiendaNombre
  const ruc = config?.empresa_ruc ?? ''
  const direccion = config?.empresa_direccion ?? ''
  const whatsapp = config?.whatsapp_numero ?? ''
  const email = config?.footer_email ?? ''

  const hoy = new Date()
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const fecha = `${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`

  return (
    <main className="min-h-screen bg-[#1F1F22]">

      {/* Header */}
      <div className="bg-[#1F1F22]/95 backdrop-blur border-b border-[#2C2C30] px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/"
          className="p-1.5 rounded-full hover:bg-[#161618] transition-colors text-[#9A9A9E]">
          <IconArrowLeft size={18} />
        </Link>
        <p className="font-bold text-[#F5F5F2] text-sm">Política de privacidad</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Intro */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#3A1014' }}>
            <IconShieldLock size={22} style={{ color: 'var(--color-brand)' }} />
          </div>
          <p className="text-sm text-[#9A9A9E] leading-relaxed">
            En {tiendaNombre} cuidamos tus datos personales. Esta política explica qué información
            recopilamos, para qué la usamos y cómo la protegemos.
          </p>
        </div>

        <div className="bg-[#161618] border border-[#2C2C30] rounded-2xl p-5 flex flex-col gap-5 text-sm text-[#C9C9CD] leading-relaxed">

          <section>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
              1. Qué datos recopilamos
            </p>
            <p>
              Para procesar tu pedido recopilamos: nombre, correo electrónico, número de teléfono y
              dirección de entrega. Si presentas un reclamo a través del{' '}
              <Link href="/libro-de-reclamaciones" className="underline" style={{ color: '#F5F5F2' }}>
                Libro de Reclamaciones
              </Link>
              , también solicitamos tu número de DNI, como exige la normativa de protección al
              consumidor. Los datos de tu tarjeta (número, fecha de vencimiento, CVV) son ingresados
              directamente en la pasarela de pagos Culqi y nunca son almacenados ni vistos por{' '}
              {tiendaNombre}.
            </p>
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
              2. Para qué los usamos
            </p>
            <p>
              Usamos tus datos únicamente para: procesar y confirmar tu pedido, coordinar el envío y
              la entrega, contactarte sobre el estado de tu compra (por correo
              {whatsapp ? ' y WhatsApp' : ''}), atender consultas o reclamos, y prevenir fraudes en el
              proceso de pago. No usamos tus datos para enviarte publicidad sin tu autorización ni los
              vendemos a terceros.
            </p>
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
              3. Cómo los protegemos
            </p>
            <p>
              Tus datos se almacenan en servidores con acceso restringido y cifrado en tránsito (HTTPS).
              Los pagos se procesan a través de Culqi, una pasarela certificada PCI-DSS, por lo que{' '}
              {tiendaNombre} nunca tiene acceso a los datos completos de tu tarjeta. Solo el personal
              autorizado de {razonSocial}{ruc ? ` (RUC ${ruc})` : ''} puede acceder a tu información, y
              únicamente para los fines descritos en esta política.
            </p>
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
              4. Cookies y analítica
            </p>
            <p>
              Usamos cookies y herramientas de analítica web (como Google Tag Manager) para entender
              cómo se usa el sitio y mejorar tu experiencia de compra. Estas herramientas no recopilan
              información que te identifique personalmente más allá de lo necesario para fines
              estadísticos.
            </p>
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
              5. Tus derechos
            </p>
            <p>
              De acuerdo con la Ley N.º 29733 de Protección de Datos Personales, puedes solicitar en
              cualquier momento el acceso, rectificación, cancelación u oposición al tratamiento de tus
              datos personales, escribiéndonos a través de los canales de contacto indicados a
              continuación.
            </p>
          </section>

          {(whatsapp || email) && (
            <section>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand)' }}>
                6. Contacto
              </p>
              <p>
                {direccion && <>{direccion}<br /></>}
                {email && <>Email: {email}<br /></>}
                {whatsapp && <>WhatsApp: +{whatsapp}</>}
              </p>
            </section>
          )}

          <p className="text-xs text-[#6B6B70] pt-2 border-t border-[#2C2C30]">
            Última actualización: {fecha}
          </p>
        </div>
      </div>
    </main>
  )
}

