import { getTenant, esPlanPro } from '@/lib/tenant'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { PagoCheckout } from './PagoCheckout'
import { WhatsAppCheckout } from './WhatsAppCheckout'

export const dynamic = 'force-dynamic'

export default async function CheckoutPagoPage() {
  const tenant = await getTenant()

  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: config } = await admin
    .from('config_tienda')
    .select('tienda_nombre')
    .eq('tenant_id', tenant.id)
    .single()

  const tiendaNombre = config?.tienda_nombre ?? tenant.nombre

  if (!esPlanPro(tenant)) {
    return <WhatsAppCheckout tiendaNombre={tiendaNombre} />
  }

  const { data: tenantData } = await admin
    .from('tenants')
    .select('culqi_public_key')
    .eq('id', tenant.id)
    .single()

  const culqiPublicKey = tenantData?.culqi_public_key ?? undefined

  return <PagoCheckout tiendaNombre={tiendaNombre} culqiPublicKey={culqiPublicKey} />
}
