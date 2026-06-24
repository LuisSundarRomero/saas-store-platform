import { headers } from 'next/headers'

export type Tenant = {
  id: string
  slug: string
  nombre: string
  color: string
  logo: string
  fontDisplay: string
  fontBody: string
  theme: string
  plan: string   // 'basico' | 'pro' | '' (sin plan asignado)
}

export function esPlanPro(tenant: Tenant) {
  return tenant.plan === 'pro'
}

// Llama esto en cualquier Server Component para obtener el tenant activo
export async function getTenant(): Promise<Tenant> {
  const h = await headers()
  return {
    id:          h.get('x-tenant-id')           ?? '',
    slug:        h.get('x-tenant-slug')         ?? '',
    nombre:      h.get('x-tenant-nombre')       ?? 'Mi Tienda',
    color:       h.get('x-tenant-color')        ?? '#000000',
    logo:        h.get('x-tenant-logo')         ?? '',
    fontDisplay: h.get('x-tenant-font-display') ?? '',
    fontBody:    h.get('x-tenant-font-body')    ?? '',
    theme:       h.get('x-tenant-theme')        ?? 'dark',
    plan:        h.get('x-tenant-plan')         ?? '',
  }
}
