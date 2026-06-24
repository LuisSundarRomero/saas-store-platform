import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getTenant, esPlanPro } from '@/lib/tenant'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const tenant = await getTenant()
  const admin = createAdminClient()
  const { data: ct } = await admin.from('config_tienda').select('tienda_nombre').eq('tenant_id', tenant.id).single()
  const tiendaNombre = ct?.tienda_nombre ?? tenant.nombre

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar tiendaNombre={tiendaNombre} planPro={esPlanPro(tenant)} />
      <main className="flex-1 overflow-y-auto pt-12 pb-16 lg:pt-0 lg:pb-0">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
