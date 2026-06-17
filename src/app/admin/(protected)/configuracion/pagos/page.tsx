import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { getTenant } from '@/lib/tenant'
import { updateCulqiKeys } from '@/lib/actions/pagos'
import { IconDeviceFloppy, IconEye, IconEyeOff } from '@tabler/icons-react'
import { CulqiKeysForm } from './CulqiKeysForm'

export default async function PagosPage() {
  const tenant = await getTenant()
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: tenantData } = await admin
    .from('tenants')
    .select('culqi_public_key, culqi_secret_key')
    .eq('id', tenant.id)
    .single()

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pagos / Culqi</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Configura las llaves de tu cuenta Culqi para procesar cobros con tarjeta y Yape.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
        <strong>¿Cómo obtener tus llaves?</strong> Ingresa a{' '}
        <span className="font-mono">panel.culqi.com</span> → Desarrollo → Llaves de API.
        Usa las llaves de <strong>producción</strong> cuando estés listo para vender.
      </div>

      <CulqiKeysForm
        culqiPublicKey={tenantData?.culqi_public_key ?? ''}
        culqiSecretKey={tenantData?.culqi_secret_key ?? ''}
        action={updateCulqiKeys}
      />
    </div>
  )
}
