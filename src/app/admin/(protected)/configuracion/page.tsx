import { createClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { ConfigForm } from '@/components/admin/ConfigForm'

export default async function ConfiguracionPage() {
  const [supabase, tenant] = await Promise.all([createClient(), getTenant()])
  const { data: config } = await supabase.from('config').select('*').eq('tenant_id', tenant.id).single()

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-400 mt-0.5">Ajustes generales de la tienda</p>
      </div>
      <ConfigForm config={config} />
    </div>
  )
}
