import { headers } from 'next/headers'

export type Tenant = {
  id: string
  slug: string
  nombre: string
  color: string
  logo: string
}

// Llama esto en cualquier Server Component para obtener el tenant activo
export async function getTenant(): Promise<Tenant> {
  const h = await headers()
  const tenant = {
    id:     h.get('x-tenant-id')     ?? '',
    slug:   h.get('x-tenant-slug')   ?? '',
    nombre: h.get('x-tenant-nombre') ?? 'Mi Tienda',
    color:  h.get('x-tenant-color')  ?? '#000000',
    logo:   h.get('x-tenant-logo')   ?? '',
  }
  return tenant
}
