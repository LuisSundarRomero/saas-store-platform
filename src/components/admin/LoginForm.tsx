'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { IconMail, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'
import { verifyTurnstileToken } from '@/lib/actions/turnstile'

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
    }
  }
}

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [isPending, startTransition] = useTransition()
  const turnstileRef = useRef<HTMLDivElement>(null)

  const renderTurnstile = useCallback(() => {
    if (turnstileRef.current && window.turnstile) {
      window.turnstile.render(turnstileRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
        callback: (token: string) => setTurnstileToken(token),
      })
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!turnstileToken) {
      setError('Completa la verificación de seguridad')
      return
    }

    startTransition(async () => {
      const tokenValido = await verifyTurnstileToken(turnstileToken)
      if (!tokenValido) {
        setError('Verificación de seguridad fallida, intenta de nuevo')
        window.turnstile?.reset()
        setTurnstileToken('')
        return
      }

      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email o contraseña incorrectos')
        window.turnstile?.reset()
        setTurnstileToken('')
      } else {
        router.push('/admin/pedidos')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        onLoad={renderTurnstile}
        strategy="lazyOnload"
      />

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
            className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:border-red-400 focus:outline-none transition-colors autofill:[-webkit-text-fill-color:#111827] autofill:[box-shadow:0_0_0_1000px_#F9FAFB_inset]"
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
            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            required
            autoComplete="current-password"
            className="w-full pl-10 pr-11 py-3.5 rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:bg-white focus:border-red-400 focus:outline-none transition-colors autofill:[-webkit-text-fill-color:#111827] autofill:[box-shadow:0_0_0_1000px_#F9FAFB_inset]"
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

      {/* Verificación de seguridad */}
      <div ref={turnstileRef} className="flex justify-center" />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-2xl">
          <span>⚠ï¸</span> {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full font-semibold py-4 rounded-2xl text-white text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-1"
        style={{
          backgroundColor: 'var(--color-brand)',
          boxShadow: '0 4px 20px rgba(225,29,46,0.25)',
        }}
      >
        {isPending ? 'Entrando...' : 'Ingresar al panel'}
      </button>
    </form>
  )
}

