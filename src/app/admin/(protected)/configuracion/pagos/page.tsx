import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { getTenant, esPlanPro } from '@/lib/tenant'
import { updateCulqiKeys } from '@/lib/actions/pagos'
import { CulqiKeysForm } from './CulqiKeysForm'
import { IconLock, IconArrowRight } from '@tabler/icons-react'

export default async function PagosPage() {
  const tenant = await getTenant()

  // Plan básico: mostrar upgrade wall, no cargar llaves
  if (!esPlanPro(tenant)) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pagos / Culqi</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Configura pagos con tarjeta y Yape para tus clientes.
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <IconLock size={28} className="text-indigo-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Disponible en Plan Pro
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
            Los pagos con tarjeta y Yape vía Culqi están disponibles en el plan Pro.
            Con tu plan actual (Básico), tus clientes coordinan el pago por WhatsApp.
          </p>
          <div className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-default">
            Habla con nosotros para cambiar de plan
            <IconArrowRight size={15} />
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Escríbenos por WhatsApp y te ayudamos con el cambio.
          </p>
        </div>
      </div>
    )
  }

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
