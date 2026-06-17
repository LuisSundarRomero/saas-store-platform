'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { getTenant } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function updateCulqiKeys(formData: FormData) {
  const tenant = await getTenant()
  const admin = getAdminClient()

  const culqiPublicKey = (formData.get('culqi_public_key') as string)?.trim() || null
  const culqiSecretKey = (formData.get('culqi_secret_key') as string)?.trim() || null

  const { error } = await admin
    .from('tenants')
    .update({
      culqi_public_key: culqiPublicKey,
      culqi_secret_key: culqiSecretKey,
    })
    .eq('id', tenant.id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/configuracion/pagos')
}
