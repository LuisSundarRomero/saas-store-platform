'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'

// ─── Auth ────────────────────────────────────────────────────

export async function loginSuperadmin(formData: FormData) {
  const key = formData.get('key') as string
  const expected = process.env.SUPERADMIN_KEY
  if (!expected || key !== expected) {
    return { error: 'Clave incorrecta' }
  }
  const cookieStore = await cookies()
  cookieStore.set('sa_key', key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/',
  })
  redirect('/superadmin')
}

export async function logoutSuperadmin() {
  const cookieStore = await cookies()
  cookieStore.delete('sa_key')
  redirect('/superadmin/login')
}

// ─── Tenants ─────────────────────────────────────────────────

export async function getTenants() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('tenants')
    .select('id, slug, nombre, color_primario, activo, etapa, created_at, planes!plan_id(label, color)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getPlanes() {
  const admin = createAdminClient()
  const { data } = await admin.from('planes').select('id, nombre, label, color').eq('activo', true)
  return data ?? []
}

export interface CrearTenantInput {
  slug: string
  nombre: string
  color_primario: string
  plan_id: string
  theme: string
  etapa: string
  font_display: string
  font_body: string
  // Admin user
  modo_usuario: 'nuevo' | 'existente'
  email: string
  password?: string
}

export async function crearTenant(input: CrearTenantInput): Promise<{ error?: string }> {
  const admin = createAdminClient()

  // 1. Validar slug único
  const { data: existing } = await admin.from('tenants').select('id').eq('slug', input.slug).single()
  if (existing) return { error: `El slug "${input.slug}" ya está en uso.` }

  // 2. Crear fila del tenant
  const { data: tenant, error: tenantError } = await admin
    .from('tenants')
    .insert({
      slug:           input.slug.toLowerCase().trim(),
      nombre:         input.nombre.trim(),
      color_primario: input.color_primario || '#000000',
      plan_id:        input.plan_id || null,
      theme:          input.theme || 'light',
      etapa:          input.etapa || 'demo',
      font_display:   input.font_display || '',
      font_body:      input.font_body || '',
      activo:         true,
    })
    .select('id')
    .single()

  if (tenantError || !tenant) return { error: tenantError?.message ?? 'Error creando tenant' }

  const tenantId = tenant.id

  // 3. Crear suscripción si tiene plan
  if (input.plan_id) {
    await admin.from('suscripciones').insert({
      tenant_id: tenantId,
      plan_id:   input.plan_id,
      estado:    'activo',
    })
  }

  // 4. Crear o asignar usuario admin
  if (input.modo_usuario === 'nuevo') {
    if (!input.password) return rollbackTenant(admin, tenantId, 'La contraseña es requerida')
    const { error: userError } = await admin.auth.admin.createUser({
      email:          input.email.trim().toLowerCase(),
      password:       input.password,
      email_confirm:  true,
      user_metadata:  { tenant_id: tenantId },
    })
    if (userError) return rollbackTenant(admin, tenantId, userError.message)
  } else {
    // Buscar usuario existente por email
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (listError) return rollbackTenant(admin, tenantId, listError.message)
    const user = users.find((u) => u.email?.toLowerCase() === input.email.trim().toLowerCase())
    if (!user) return rollbackTenant(admin, tenantId, `No se encontró ningún usuario con el email "${input.email}"`)
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...(user.user_metadata ?? {}), tenant_id: tenantId },
    })
    if (updateError) return rollbackTenant(admin, tenantId, updateError.message)
  }

  return {}
}

async function rollbackTenant(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  tenantId: string,
  errorMsg: string
): Promise<{ error: string }> {
  await admin.from('tenants').delete().eq('id', tenantId)
  return { error: errorMsg }
}

export async function toggleTenantActivo(tenantId: string, activo: boolean) {
  const admin = createAdminClient()
  await admin.from('tenants').update({ activo }).eq('id', tenantId)
}

export async function buscarUsuariosPorEmail(query: string) {
  if (query.length < 3) return []
  const admin = createAdminClient()
  const { data: { users } } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  return users
    .filter((u) => u.email?.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10)
    .map((u) => ({
      id:        u.id,
      email:     u.email ?? '',
      tenant_id: (u.user_metadata?.tenant_id as string | undefined) ?? null,
    }))
}
