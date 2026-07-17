'use client'

import { useEffect, useState } from 'react'
import { IconLock, IconEye, IconEyeOff } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'

export function ResetPasswordForm() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })

    // Si la sesión de recuperación ya se estableció antes de montar el listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    supabase.auth.updateUser({ password }).then(({ error }) => {
      setIsSubmitting(false)
      if (error) {
        setError(error.message)
        return
      }
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/admin/pedidos'
      }, 1500)
    })
  }

  if (!ready) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-sm text-gray-500">Verificando el link de restablecimiento…</p>
        <p className="text-xs text-gray-400">Si esta pantalla no avanza, el link puede haber expirado. Pide uno nuevo.</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-sm font-semibold text-green-600">Contraseña actualizada ✓</p>
        <p className="text-xs text-gray-400">Entrando al panel…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Nueva contraseña</label>
        <div className="relative">
          <IconLock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
            autoComplete="new-password"
            className="w-full pl-10 pr-11 py-3.5 rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:border-pv focus:outline-none transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-50 transition-all duration-150"
            tabIndex={-1}
          >
            {showPw ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Confirmar contraseña</label>
        <div className="relative">
          <IconLock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type={showPw ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            required
            autoComplete="new-password"
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:border-pv focus:outline-none transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-2xl">
          <span>⚠️</span> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full font-semibold py-4 rounded-2xl text-white text-sm bg-pv transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-1"
        style={{ boxShadow: '0 4px 20px color-mix(in srgb, var(--color-pv) 25%, transparent)' }}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
      </button>
    </form>
  )
}
