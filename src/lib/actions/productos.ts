import { createClient } from '@/lib/supabase/server'
import { Categoria, Producto } from '@/types'

export async function getCategorias(): Promise<Categoria[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('activa', true)
    .order('orden', { ascending: true })
  if (error) return []
  return data ?? []
}

export async function getProductos(params?: {
  categoriaSlug?: string
  search?: string
  limit?: number
  sort?: string
}): Promise<Producto[]> {
  const supabase = await createClient()

  // Usa !inner para filtrar por slug en una sola query
  const select = params?.categoriaSlug
    ? '*, categorias!inner(id, nombre, slug)'
    : '*, categorias(id, nombre, slug)'

  const ascending = params?.sort === 'precio_asc'
  const orderCol = params?.sort?.startsWith('precio') ? 'precio' : 'created_at'

  let query = supabase
    .from('productos')
    .select(select)
    .eq('visible', true)
    .order(orderCol, { ascending })

  if (params?.categoriaSlug) {
    query = query.eq('categorias.slug', params.categoriaSlug)
  }

  if (params?.search) {
    query = query.ilike('nombre', `%${params.search}%`)
  }

  if (params?.limit) {
    query = query.limit(params.limit)
  }

  const { data, error } = await query
  if (error) return []
  return (data ?? []) as Producto[]
}

export async function getProductosDestacados(): Promise<Producto[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('productos')
    .select('*, categorias(id, nombre, slug)')
    .eq('visible', true)
    .eq('destacado', true)
    .order('updated_at', { ascending: false })
    .limit(4)
  return (data ?? []) as Producto[]
}

export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(id, nombre, slug)')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('[getProductoBySlug] slug:', slug, 'error:', error.message)
    return null
  }
  return data as Producto
}
