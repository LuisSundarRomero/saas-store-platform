import { createPublicClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { Categoria, Producto } from '@/types'
import { unstable_noStore as noStore } from 'next/cache'

export async function getCategorias(): Promise<Categoria[]> {
  noStore()
  const [supabase, tenant] = await Promise.all([createPublicClient(), getTenant()])
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('activa', true)
    .order('orden', { ascending: true })
  if (error) return []
  return data ?? []
}

const PAGE_SIZE = 24

export async function getProductos(params?: {
  categoriaSlug?: string
  search?: string
  limit?: number
  offset?: number
  sort?: string
}): Promise<{ productos: Producto[]; hasMore: boolean }> {
  noStore()
  const [supabase, tenant] = await Promise.all([createPublicClient(), getTenant()])

  const select = params?.categoriaSlug
    ? '*, categorias!inner(id, nombre, slug)'
    : '*, categorias(id, nombre, slug)'

  const ascending = params?.sort === 'precio_asc'
  const orderCol = params?.sort?.startsWith('precio') ? 'precio' : 'created_at'
  const limit = params?.limit ?? PAGE_SIZE
  const offset = params?.offset ?? 0

  let query = supabase
    .from('productos')
    .select(select)
    .eq('tenant_id', tenant.id)
    .eq('visible', true)
    .order('destacado', { ascending: false })
    .order('es_nuevo', { ascending: false })
    .order(orderCol, { ascending })
    .range(offset, offset + limit) // range is inclusive → fetches limit+1 rows to detect hasMore

  if (params?.categoriaSlug) {
    query = query.eq('categorias.slug', params.categoriaSlug)
  }

  if (params?.search) {
    query = query.ilike('nombre', `%${params.search}%`)
  }

  const { data, error } = await query
  if (error) return { productos: [], hasMore: false }
  const rows = (data ?? []) as Producto[]
  const hasMore = rows.length > limit
  return { productos: hasMore ? rows.slice(0, limit) : rows, hasMore }
}

export async function getProductosDestacados(): Promise<Producto[]> {
  noStore()
  const [supabase, tenant] = await Promise.all([createPublicClient(), getTenant()])
  const { data } = await supabase
    .from('productos')
    .select('*, categorias(id, nombre, slug)')
    .eq('tenant_id', tenant.id)
    .eq('visible', true)
    .eq('destacado', true)
    .order('updated_at', { ascending: false })
    .limit(4)
  return (data ?? []) as Producto[]
}

export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  const [supabase, tenant] = await Promise.all([createPublicClient(), getTenant()])
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(id, nombre, slug)')
    .eq('tenant_id', tenant.id)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('[getProductoBySlug] slug:', slug, 'error:', error.message)
    return null
  }
  return data as Producto
}
