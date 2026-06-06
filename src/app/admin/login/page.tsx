import { LoginForm } from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#FDF2F8' }}>

      {/* Top — fondo rosa con branding */}
      <div
        className="flex flex-col items-center justify-end pb-10 pt-16 px-6 flex-none"
        style={{ background: 'linear-gradient(160deg, #FBCFE8 0%, #F9A8D4 40%, #EC4899 100%)' }}
      >
        {/* Anillo decorativo */}
        <div
          className="flex items-center justify-center rounded-full mb-5"
          style={{
            width: 72, height: 72,
            background: 'rgba(255,255,255,0.25)',
            boxShadow: '0 0 0 12px rgba(255,255,255,0.12)',
          }}
        >
          <span className="text-3xl">🎀</span>
        </div>

        <h1 className="font-serif text-4xl font-semibold text-white" style={{ letterSpacing: '-0.01em' }}>
          Kuutsu.pe
        </h1>
        <p className="text-pink-100 text-sm mt-1.5 font-medium">Panel de administración</p>
      </div>

      {/* Bottom — card blanca con forma de "sheet" */}
      <div
        className="flex-1 flex flex-col items-center px-5 pt-0 pb-10"
        style={{ background: '#FDF2F8' }}
      >
        <div
          className="w-full max-w-md bg-white -mt-6 rounded-3xl p-7 sm:p-10"
          style={{ boxShadow: '0 -2px 0 0 rgba(236,72,153,0.08), 0 8px 40px rgba(0,0,0,0.06)' }}
        >
          <LoginForm />
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#F9A8D4' }}>
          Acceso restringido al equipo de Kuutsu
        </p>
      </div>

    </main>
  )
}
