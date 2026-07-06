'use server'

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') return true

  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || !token) return false

  const body = new URLSearchParams()
  body.append('secret', secret)
  body.append('response', token)

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  })

  const data = await res.json()
  return data.success === true
}
