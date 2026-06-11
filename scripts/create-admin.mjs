import { randomBytes } from 'crypto'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const email = 'admin@anarchyy.pe'
const password = randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12) + 'A1!'

const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  },
  body: JSON.stringify({ email, password, email_confirm: true }),
})

const data = await res.json()

if (!res.ok) {
  console.error('ERROR:', res.status, JSON.stringify(data))
  process.exit(1)
}

console.log('Usuario creado correctamente')
console.log('Email:', email)
console.log('Password:', password)
console.log('User ID:', data.id)
