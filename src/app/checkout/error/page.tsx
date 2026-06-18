import { getTenant } from '@/lib/tenant'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { CheckoutError } from './CheckoutError'

export const dynamic = 'force-dynamic'

export default async function CheckoutErrorPage() {
  const tenant = await getTenant()
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: config } = await admin
    .from('config')
    .select('whatsapp_numero')
    .eq('tenant_id', tenant.id)
    .single()

  return <CheckoutError whatsappNumero={config?.whatsapp_numero ?? ''} />
}
