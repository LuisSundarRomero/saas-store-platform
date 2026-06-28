import { createAdminClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { LibroReclamacionesClient } from '@/components/legal/LibroReclamacionesClient'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant()
  const nombre = tenant.nombre || 'Mi Tienda'
  return {
    title: 'Libro de Reclamaciones',
    description: `Presenta tu reclamación o queja en ${nombre}. Respuesta garantizada en 30 días.`,
    alternates: { canonical: '/libro-de-reclamaciones' },
    robots: { index: false, follow: false },
  }
}

export default async function LibroReclamacionesPage() {
  const tenant = await getTenant()
  const { data: ct } = await createAdminClient()
    .from('config_tienda')
    .select('tienda_nombre, empresa_razon, empresa_ruc, empresa_dir, whatsapp_numero')
    .eq('tenant_id', tenant.id)
    .single()

  return (
    <LibroReclamacionesClient
      tiendaNombre={ct?.tienda_nombre ?? tenant.nombre}
      razonSocial={ct?.empresa_razon ?? ''}
      ruc={ct?.empresa_ruc ?? ''}
      direccion={ct?.empresa_dir ?? ''}
      whatsappNumero={ct?.whatsapp_numero ?? ''}
    />
  )
}
