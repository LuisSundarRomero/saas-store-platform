import { createClient } from '@/lib/supabase/server'
import { LibroReclamacionesClient } from '@/components/legal/LibroReclamacionesClient'

export default async function LibroReclamacionesPage() {
  const supabase = await createClient()
  const { data: config } = await supabase
    .from('config')
    .select('tienda_nombre, empresa_razon_social, empresa_ruc, empresa_direccion, whatsapp_numero')
    .single()

  return (
    <LibroReclamacionesClient
      tiendaNombre={config?.tienda_nombre ?? 'Mi Tienda'}
      razonSocial={config?.empresa_razon_social ?? ''}
      ruc={config?.empresa_ruc ?? ''}
      direccion={config?.empresa_direccion ?? ''}
      whatsappNumero={config?.whatsapp_numero ?? ''}
    />
  )
}
