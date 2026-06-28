'use server'

import { headers, cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { loginRatelimit } from '@/lib/ratelimit'

export async function loginAdmin(
  email: string,
  password: string
): Promise<{ success: true } | { error: string; rateLimited?: boolean }> {
  const h = await headers()
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    h.get('x-real-ip') ??
    'unknown'

  const { success, reset } = await loginRatelimit.limit(`admin:${ip}`)

  if (!success) {
    const waitMin = Math.ceil((reset - Date.now()) / 60000)
    return {
      error: `Demasiados intentos. Espera ${waitMin} minuto${waitMin !== 1 ? 's' : ''} e intenta de nuevo.`,
      rateLimited: true,
    }
  }

  // createClient() solo tiene getAll — no escribe cookies desde server actions.
  // Necesitamos setAll para que signInWithPassword persista la sesión en el navegador.
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: 'Email o contraseña incorrectos' }

  return { success: true }
}
