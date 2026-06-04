import { createClient } from '@/lib/supabase/server'
import { ConfigForm } from '@/components/admin/ConfigForm'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: config } = await supabase.from('config').select('*').single()

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
