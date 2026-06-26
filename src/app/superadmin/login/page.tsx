'use client'

import { useState, useTransition } from 'react'
import { loginSuperadmin } from '@/lib/actions/superadmin'

export default function SuperadminLoginPage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError('')
    startTransition(async () => {
      const result = await loginSuperadmin(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: '#0e0e10' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1a0a0c' }}>
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-xl font-bold text-white">Superadmin</h1>
          <p className="text-sm mt-1" style={{ color: '#6B6B70' }}>Acceso restringido a operadores de la plataforma</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="key"
            type="password"
            placeholder="Clave de acceso"
            required
            autoComplete="off"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 text-white placeholder-gray-600"
            style={{ backgroundColor: '#1a1a1c', border: '1px solid #2a2a2e' }}
          />
          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-xl px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full font-semibold py-3 rounded-xl text-sm text-white transition-opacity disabled:opacity-60 hover:opacity-90"
            style={{ backgroundColor: '#E11D2E' }}
          >
            {isPending ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  )
}
