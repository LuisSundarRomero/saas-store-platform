import { LoginForm } from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[--color-surface] flex items-center justify-center px-4">
      <div className="bg-white rounded-[--radius-xl] p-8 max-w-sm w-full shadow-sm">
        <h1 className="text-2xl font-semibold mb-1">Panel admin</h1>
        <p className="text-sm text-[--color-text-secondary] mb-6">Kuutsu.pe</p>
        <LoginForm />
      </div>
    </main>
  )
}
