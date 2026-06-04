import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/admin/login')

  const { data: config } = await supabase.from('config').select('tienda_nombre').single()
  const tiendaNombre = config?.tienda_nombre ?? 'Kuutsu.pe'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar tiendaNombre={tiendaNombre} />
      <main className="flex-1 overflow-y-auto pt-12 pb-16 lg:pt-0 lg:pb-0">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
