'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { IconMail, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email o contraseña incorrectos')
      } else {
        router.push('/admin/pedidos')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Email</label>
        <div className="relative">
          <IconMail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@anarchyy.pe"
            required
            autoComplete="email"
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Contraseña */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Contraseña</label>
        <div className="relative">
          <IconLock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full pl-10 pr-11 py-3.5 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPw ? <IconEyeOff size={17} /> : <IconEye size={17} />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-2xl">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full font-semibold py-4 rounded-2xl text-white text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-1"
        style={{
          backgroundColor: '#E11D2E',
          boxShadow: '0 4px 20px rgba(225,29,46,0.25)',
        }}
      >
        {isPending ? 'Entrando...' : 'Ingresar al panel'}
      </button>
    </form>
  )
}
