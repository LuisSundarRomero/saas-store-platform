'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import type { CampoCheckoutConfig, CampoCheckoutTipo } from '@/types'

const DEFAULTS: Array<{ key: string; label: string; tipo: CampoCheckoutTipo; placeholder: string; opciones: string[]; requerido: boolean; orden: number }> = [
  { key: 'dni',        label: 'DNI',           tipo: 'texto',  placeholder: 'Ej: 12345678',                opciones: [], requerido: true, orden: 1 },
  { key: 'distrito',   label: 'Distrito',      tipo: 'texto',  placeholder: 'Ej: Miraflores',              opciones: [], requerido: true, orden: 2 },
  { key: 'direccion',  label: 'Dirección',     tipo: 'texto',  placeholder: 'Calle, número, referencia',   opciones: [], requerido: true, orden: 3 },
  { key: 'modo_envio', label: 'Modo de envío', tipo: 'select', placeholder: '',                            opciones: [], requerido: true, orden: 4 },
]

function slugifyKey(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '')
}

// Lee los campos del tenant; si nunca se configuró ninguno (tenant nuevo
// que no pasó por el seed de sass-admin, o tenant existente creado antes
// de este módulo), siembra los 4 campos por defecto una sola vez.
async function getOrSeedCampos(tenantId: string, admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from('campos_checkout')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('orden', { ascending: true })

  if (data && data.length > 0) return data as CampoCheckoutConfig[]

  await admin.from('campos_checkout').insert(
    DEFAULTS.map((d) => ({ ...d, tenant_id: tenantId }))
  )

  const { data: seeded } = await admin
    .from('campos_checkout')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('orden', { ascending: true })

  return (seeded ?? []) as CampoCheckoutConfig[]
}

export async function getCamposCheckout(): Promise<CampoCheckoutConfig[]> {
  const admin = createAdminClient()
  const tenant = await getTenant()
  return getOrSeedCampos(tenant.id, admin)
}

export async function getCamposCheckoutActivos(): Promise<CampoCheckoutConfig[]> {
  const campos = await getCamposCheckout()
  return campos.filter((c) => c.activo)
}

export async function crearCampoCheckout(data: {
  label: string
  tipo: CampoCheckoutTipo
  placeholder: string
  opciones: string[]
  requerido: boolean
}) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  const key = slugifyKey(data.label)
  if (!key) throw new Error('Nombre inválido')

  const { count } = await admin
    .from('campos_checkout')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant.id)

  const { error } = await admin.from('campos_checkout').insert({
    ...data,
    key,
    tenant_id: tenant.id,
    activo: true,
    orden: (count ?? 0) + 1,
  })
  if (error) {
    if (error.code === '23505') throw new Error('Ya existe un campo con ese nombre')
    throw new Error(error.message)
  }
}

export async function actualizarCampoCheckout(id: string, data: {
  label: string
  tipo: CampoCheckoutTipo
  placeholder: string
  opciones: string[]
  requerido: boolean
}) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  // La key interna nunca cambia — evita romper respuestas ya guardadas en pedidos anteriores
  const { error } = await admin
    .from('campos_checkout')
    .update(data)
    .eq('id', id)
    .eq('tenant_id', tenant.id)
  if (error) throw new Error(error.message)
}

export async function eliminarCampoCheckout(id: string) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  const { error } = await admin.from('campos_checkout').delete().eq('id', id).eq('tenant_id', tenant.id)
  if (error) throw new Error(error.message)
}

export async function toggleActivoCampoCheckout(id: string, activo: boolean) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  await admin.from('campos_checkout').update({ activo }).eq('id', id).eq('tenant_id', tenant.id)
}

export async function reordenarCamposCheckout(idsEnOrden: string[]) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  await Promise.all(
    idsEnOrden.map((id, i) =>
      admin.from('campos_checkout').update({ orden: i + 1 }).eq('id', id).eq('tenant_id', tenant.id)
    )
  )
}
