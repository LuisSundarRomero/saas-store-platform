import { LoginForm } from '@/components/admin/LoginForm'
import { createClient } from '@/lib/supabase/server'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: config } = await supabase.from('config').select('tienda_nombre').single()
  const tiendaNombre = config?.tienda_nombre ?? 'Panel admin'

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'linear-gradient(160deg, #fff5f5 0%, #fee2e2 100%)' }}
    >
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="flex items-center justify-center rounded-2xl mb-4"
            style={{ width: 52, height: 52, background: 'rgba(225,29,46,0.1)' }}
          >
            <span className="text-2xl">🦇</span>
          </div>
          <h1 className="font-display text-3xl" style={{ color: '#E11D2E' }}>
            {tiendaNombre}
          </h1>
          <p className="text-xs text-gray-400 mt-1">Panel de administración</p>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-3xl p-7"
          style={{ boxShadow: '0 4px 32px rgba(225,29,46,0.10), 0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <LoginForm />
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Acceso restringido al equipo de Anarchy
        </p>
      </div>
    </main>
  )
}
