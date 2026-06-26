'use server'

import { createClient } from '@/lib/supabase/server'
import { EstadoPedido } from '@/types'

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
  filtro?: string // 'visible' | 'oculto' | 'destacado' | 'nuevo' | 'agotado'
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('productos')
    .select('*, categorias(nombre, slug)')
    .order('created_at', { ascending: false })

  if (filtros?.q) {
    query = query.ilike('nombre', `%${filtros.q}%`)
  }

  if (filtros?.categoriaSlug) {
    const { data: cat } = await supabase.from('categorias').select('id').eq('slug', filtros.categoriaSlug).single()
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

  const { data } = await query
  return data ?? []
}

export async function toggleVisibilidadProducto(productoId: string, visible: boolean) {
  const supabase = await createClient()
  await supabase.from('productos').update({ visible }).eq('id', productoId)
}

export async function deleteProducto(productoId: string) {
  const supabase = await createClient()
  await supabase.from('productos').delete().eq('id', productoId)
}

export async function toggleEsNuevoProducto(productoId: string, esNuevo: boolean) {
  const supabase = await createClient()
  await supabase.from('productos').update({ es_nuevo: esNuevo }).eq('id', productoId)
}

export async function toggleDestacadoProducto(productoId: string, destacado: boolean) {
  const supabase = await createClient()

  if (destacado) {
    // Verificar límite de 4 destacados
    const { count } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true })
      .eq('destacado', true)

    if ((count ?? 0) >= 4) {
      throw new Error('Máximo 4 productos destacados')
    }
  }

  await supabase.from('productos').update({ destacado }).eq('id', productoId)
}

export async function getCategorias() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categorias')
    .select('*')
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
  const supabase = await createClient()
  if (data.id) {
    const { error } = await supabase.from('categorias').update(data).eq('id', data.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('categorias').insert(data)
    if (error) throw new Error(error.message)
  }
}

export async function deleteCategoria(id: string) {
  const supabase = await createClient()
  await supabase.from('categorias').delete().eq('id', id)
}

export async function getPedidosCount(filtros?: { estado?: string; search?: string }) {
  const supabase = await createClient()
  let query = supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })

  if (filtros?.estado && filtros.estado !== 'todos') {
    query = query.eq('estado', filtros.estado)
  }
  if (filtros?.search) {
    query = query.or(
      `order_id.ilike.%${filtros.search}%,cliente_telefono.ilike.%${filtros.search}%`
    )
  }
  const { count } = await query
  return count ?? 0
}

export async function reordenarCategorias(idsEnOrden: string[]) {
  const supabase = await createClient()
  await Promise.all(
    idsEnOrden.map((id, i) =>
      supabase.from('categorias').update({ orden: i + 1 }).eq('id', id)
    )
  )
}
