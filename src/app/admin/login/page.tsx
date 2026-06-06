import { LoginForm } from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(145deg, #fff 0%, #FDF2F8 50%, #FCE7F3 100%)' }}
    >
      {/* Card */}
      <div className="w-full max-w-md">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: '#FCE7F3' }}>
            <span className="text-2xl">🎀</span>
          </div>
          <h1 className="font-serif text-3xl font-semibold" style={{ color: '#EC4899' }}>
            Kuutsu.pe
          </h1>
          <p className="text-sm text-gray-400 mt-1">Panel de administración</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-sm border border-pink-50 p-8 sm:p-10">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          Acceso restringido al equipo de Kuutsu
        </p>
      </div>
    </main>
  )
}
