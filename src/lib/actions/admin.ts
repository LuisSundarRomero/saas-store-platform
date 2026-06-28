'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import type { EstadoPedido, ConfigTienda, ConfigAnuncio, ConfigBanner, ConfigFooter, ConfigMensajes, ConfigNosotros } from '@/types'

// Re-export so existing imports from '@/lib/actions/admin' still work
export type { ConfigTienda, ConfigAnuncio, ConfigBanner, ConfigFooter, ConfigMensajes, ConfigNosotros } from '@/types'

export async function getPedidos(filtros?: {
  estado?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('pedidos')
    .select('*, pedido_items(cantidad)')
    .order('created_at', { ascending: false })

  if (filtros?.estado && filtros.estado !== 'todos') query = query.eq('estado', filtros.estado)
  if (filtros?.search) query = query.or(`order_id.ilike.%${filtros.search}%,cliente_telefono.ilike.%${filtros.search}%`)
  if (filtros?.limit) { const from = filtros.offset ?? 0; query = query.range(from, from + filtros.limit - 1) }

  const { data, error } = await query
  if (error) return []
  return data ?? []
}

export async function getPedidosCount(filtros?: { estado?: string; search?: string }) {
  const supabase = await createClient()
  let query = supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })
  if (filtros?.estado && filtros.estado !== 'todos') query = query.eq('estado', filtros.estado)
  if (filtros?.search) query = query.or(`order_id.ilike.%${filtros.search}%,cliente_telefono.ilike.%${filtros.search}%`)
  const { count } = await query
  return count ?? 0
}

export async function getPedidoAdmin(orderId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pedidos')
    .select('*, pedido_items(*), estado_historial(estado, changed_at)')
    .eq('order_id', orderId)
    .single()
  return data
}

export async function updateEstadoPedido(pedidoId: string, estado: EstadoPedido, comprobanteUrl?: string) {
  const supabase = await createClient()
  const updates: Record<string, unknown> = { estado }
  if (comprobanteUrl) updates.comprobante_url = comprobanteUrl
  const { error } = await supabase
    .from('pedidos')
    .update(updates)
    .eq('id', pedidoId)
  if (error) throw new Error(error.message)
}

export async function getProductosAdmin(filtros?: {
  q?: string
  categoriaSlug?: string
  filtro?: string
  limit?: number
  offset?: number
}): Promise<{ data: unknown[]; total: number; stats: { visibles: number; agotados: number; destacados: number } }> {
  const admin = createAdminClient()
  const tenant = await getTenant()

  let query = admin
    .from('productos')
    .select('*, categorias(nombre, slug)', { count: 'exact' })
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  if (filtros?.q) query = query.ilike('nombre', `%${filtros.q}%`)

  if (filtros?.categoriaSlug) {
    const { data: cat } = await admin.from('categorias').select('id').eq('slug', filtros.categoriaSlug).eq('tenant_id', tenant.id).single()
    if (cat) query = query.eq('categoria_id', cat.id)
  }

  if (filtros?.filtro === 'visible')   query = query.eq('visible', true)
  if (filtros?.filtro === 'oculto')    query = query.eq('visible', false)
  if (filtros?.filtro === 'destacado') query = query.eq('destacado', true)
  if (filtros?.filtro === 'nuevo')     query = query.eq('es_nuevo', true)
  if (filtros?.filtro === 'agotado')   query = query.eq('stock', 0)

  if (filtros?.limit) {
    const from = filtros.offset ?? 0
    query = query.range(from, from + filtros.limit - 1)
  }

  const { data, count } = await query
  const rows = (data ?? []) as Array<{ visible: boolean; stock: number | null; destacado: boolean }>

  const stats = filtros?.limit
    ? { visibles: 0, agotados: 0, destacados: 0 }
    : {
        visibles:   rows.filter((p) => p.visible).length,
        agotados:   rows.filter((p) => p.stock === 0).length,
        destacados: rows.filter((p) => p.destacado).length,
      }

  return { data: rows, total: count ?? 0, stats }
}

export async function crearProducto(data: Record<string, unknown>) {
  const admin = createAdminClient()
  const tenant = await getTenant()

  const baseSlug = data.slug as string
  for (let i = 0; i < 10; i++) {
    const slug = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`
    const { error } = await admin.from('productos').insert({ ...data, slug, tenant_id: tenant.id })
    if (!error) return
    if (!error.message.includes('slug')) throw new Error(error.message)
  }
  throw new Error('No se pudo generar un slug único')
}

export async function actualizarProducto(productoId: string, data: Record<string, unknown>) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  const { error } = await admin.from('productos').update(data).eq('id', productoId).eq('tenant_id', tenant.id)
  if (error) throw new Error(error.message)
}

export async function toggleVisibilidadProducto(productoId: string, visible: boolean) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  await admin.from('productos').update({ visible }).eq('id', productoId).eq('tenant_id', tenant.id)
}

export async function deleteProducto(productoId: string) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  await admin.from('productos').delete().eq('id', productoId).eq('tenant_id', tenant.id)
}

export async function toggleEsNuevoProducto(productoId: string, esNuevo: boolean) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  await admin.from('productos').update({ es_nuevo: esNuevo }).eq('id', productoId).eq('tenant_id', tenant.id)
}

export async function toggleDestacadoProducto(productoId: string, destacado: boolean) {
  const admin = createAdminClient()
  const tenant = await getTenant()

  if (destacado) {
    const { count } = await admin
      .from('productos')
      .select('*', { count: 'exact', head: true })
      .eq('destacado', true)
      .eq('tenant_id', tenant.id)
    if ((count ?? 0) >= 4) throw new Error('Máximo 4 productos destacados')
  }

  await admin.from('productos').update({ destacado }).eq('id', productoId).eq('tenant_id', tenant.id)
}

export async function getCategorias() {
  const admin = createAdminClient()
  const tenant = await getTenant()
  const { data } = await admin
    .from('categorias')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('orden', { ascending: true })
  return data ?? []
}

export async function upsertCategoria(data: {
  id?: string
  nombre: string
  slug: string
  orden: number
  activa: boolean
}) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  const { id, ...rest } = data
  if (id) {
    const { error } = await admin.from('categorias').update(rest).eq('id', id).eq('tenant_id', tenant.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await admin.from('categorias').insert({ ...rest, tenant_id: tenant.id })
    if (error) throw new Error(error.message)
  }
}

export async function deleteCategoria(id: string) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  await admin.from('categorias').delete().eq('id', id).eq('tenant_id', tenant.id)
}

export async function reordenarCategorias(idsEnOrden: string[]) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  await Promise.all(
    idsEnOrden.map((id, i) =>
      admin.from('categorias').update({ orden: i + 1 }).eq('id', id).eq('tenant_id', tenant.id)
    )
  )
}

// ─── Config: helpers ────────────────────────────────────────

async function upsertConfig(table: string, data: Record<string, unknown>) {
  const admin = createAdminClient()
  const tenant = await getTenant()
  const { error } = await admin
    .from(table)
    .upsert({ tenant_id: tenant.id, ...data, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' })
  if (error) throw new Error(error.message)
}

async function readConfig<T>(table: string): Promise<T | null> {
  const admin = createAdminClient()
  const tenant = await getTenant()
  if (!tenant.id) return null
  const { data } = await admin.from(table).select('*').eq('tenant_id', tenant.id).single()
  return data as T | null
}

// ─── Config: lecturas ────────────────────────────────────────

export async function getConfigTienda()   { return readConfig<ConfigTienda>('config_tienda') }
export async function getConfigAnuncio()  { return readConfig<ConfigAnuncio>('config_anuncio') }
export async function getConfigBanner()   { return readConfig<ConfigBanner>('config_banner') }
export async function getConfigFooter()   { return readConfig<ConfigFooter>('config_footer') }
export async function getConfigMensajes() { return readConfig<ConfigMensajes>('config_mensajes') }
export async function getConfigNosotros() { return readConfig<ConfigNosotros>('config_nosotros') }

// ─── Config: escrituras (una por tab) ───────────────────────

export async function guardarConfigTienda(data: Partial<ConfigTienda>)   { return upsertConfig('config_tienda', data) }
export async function guardarConfigAnuncio(data: Partial<ConfigAnuncio>) { return upsertConfig('config_anuncio', data) }
export async function guardarConfigBanner(data: Partial<ConfigBanner>)   { return upsertConfig('config_banner', data) }
export async function guardarConfigFooter(data: Partial<ConfigFooter>)   { return upsertConfig('config_footer', data) }
export async function guardarConfigMensajes(data: Partial<ConfigMensajes>) { return upsertConfig('config_mensajes', data) }
export async function guardarConfigNosotros(data: Partial<ConfigNosotros>) { return upsertConfig('config_nosotros', data) }

