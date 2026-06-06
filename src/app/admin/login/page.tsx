import { LoginForm } from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'linear-gradient(160deg, #fff5f9 0%, #fce7f3 100%)' }}
    >
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="flex items-center justify-center rounded-2xl mb-4"
            style={{ width: 52, height: 52, background: 'rgba(236,72,153,0.1)' }}
          >
            <span className="text-2xl">🎀</span>
          </div>
          <h1 className="font-serif text-3xl font-semibold" style={{ color: '#EC4899' }}>
            Kuutsu.pe
          </h1>
          <p className="text-xs text-gray-400 mt-1">Panel de administración</p>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-3xl p-7"
          style={{ boxShadow: '0 4px 32px rgba(236,72,153,0.10), 0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <LoginForm />
        </div>

        <p className="text-center text-xs text-gray-300 mt-5">
          Acceso restringido al equipo de Kuutsu
        </p>
      </div>
    </main>
  )
}
