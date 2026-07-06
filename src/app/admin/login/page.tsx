import { LoginForm } from '@/components/admin/LoginForm'
import { TenantLogo } from '@/components/admin/TenantLogo'
import { getTenant } from '@/lib/tenant'

export default async function LoginPage() {
  const tenant = await getTenant()
  const tiendaNombre = tenant.nombre || 'Panel admin'

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'linear-gradient(160deg, #fff5f5 0%, #fee2e2 100%)' }}
    >
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="flex items-center justify-center rounded-2xl mb-4 overflow-hidden select-none"
            style={{
              width: 64,
              height: 64,
              boxShadow: '0 2px 16px rgba(225,29,46,0.20), 0 1px 3px rgba(0,0,0,0.08)',
              background: tenant.logo ? undefined : 'linear-gradient(135deg, rgba(225,29,46,0.15) 0%, rgba(225,29,46,0.06) 100%)',
              border: tenant.logo ? undefined : '1px solid rgba(225,29,46,0.12)',
            }}
          >
            {tenant.logo
              ? <TenantLogo src={tenant.logo} alt={`${tiendaNombre} logo`} />
              : <span className="text-3xl drop-shadow-sm select-none">🦇</span>
            }
          </div>
          <h1 className="font-display text-3xl" style={{ color: 'var(--color-brand)' }}>
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
          Acceso restringido al equipo de {tiendaNombre}
        </p>
      </div>
    </main>
  )
}

