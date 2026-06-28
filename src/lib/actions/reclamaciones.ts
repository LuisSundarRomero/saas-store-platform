'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { EstadoReclamacion, TipoBien, TipoDocumento, TipoReclamacion } from '@/types'

// Cliente admin con service role — bypasea RLS para el envío público del formulario
function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CrearReclamoInput {
  consumidorNombre: string
  consumidorDomicilio: string
  consumidorTipoDoc: TipoDocumento
  consumidorNumDoc: string
  consumidorEmail: string
  consumidorTelefono: string
  tutorNombre: string
  bienTipo: TipoBien
  bienDescripcion: string
  montoReclamado: number | null // en centavos
  tipo: TipoReclamacion
  detalle: string
  pedido: string
}

type CrearReclamoResult =
  | { success: true; numero: number }
  | { success: false; error: string }

export async function crearReclamo(input: CrearReclamoInput): Promise<CrearReclamoResult> {
  const admin = getAdminClient()
  const tenant = await getTenant()

  const { data, error } = await admin
    .from('libro_reclamaciones')
    .insert({
      tenant_id: tenant.id,
      consumidor_nombre: input.consumidorNombre,
      consumidor_domicilio: input.consumidorDomicilio,
      consumidor_tipo_doc: input.consumidorTipoDoc,
      consumidor_num_doc: input.consumidorNumDoc,
      consumidor_email: input.consumidorEmail,
      consumidor_telefono: input.consumidorTelefono || null,
      tutor_nombre: input.tutorNombre || null,
      bien_tipo: input.bienTipo,
      bien_descripcion: input.bienDescripcion,
      monto_reclamado: input.montoReclamado,
      tipo: input.tipo,
      detalle: input.detalle,
      pedido: input.pedido,
    })
    .select('numero')
    .single()

  if (error || !data) {
    console.error('[crearReclamo]', error?.message)
    return { success: false, error: 'No pudimos registrar tu reclamación. Intenta nuevamente.' }
  }

  return { success: true, numero: data.numero as number }
}

export async function getReclamaciones(filtros?: {
  estado?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('libro_reclamaciones')
    .select('*')
    .order('created_at', { ascending: false })

  if (filtros?.estado && filtros.estado !== 'todos') {
    query = query.eq('estado', filtros.estado as EstadoReclamacion)
  }

  if (filtros?.search) {
    const num = parseInt(filtros.search)
    if (!isNaN(num)) {
      query = query.eq('numero', num)
    } else {
      query = query.or(
        `consumidor_nombre.ilike.%${filtros.search}%,consumidor_email.ilike.%${filtros.search}%`
      )
    }
  }

  if (filtros?.limit) {
    const from = filtros.offset ?? 0
    query = query.range(from, from + filtros.limit - 1)
  }

  const { data, error } = await query
  if (error) return []
  return data ?? []
}

export async function getReclamacionesCount(filtros?: { estado?: string; search?: string }) {
  const supabase = await createClient()
  let query = supabase
    .from('libro_reclamaciones')
    .select('*', { count: 'exact', head: true })

  if (filtros?.estado && filtros.estado !== 'todos') {
    query = query.eq('estado', filtros.estado as EstadoReclamacion)
  }
  if (filtros?.search) {
    const num = parseInt(filtros.search)
    if (!isNaN(num)) {
      query = query.eq('numero', num)
    } else {
      query = query.or(
        `consumidor_nombre.ilike.%${filtros.search}%,consumidor_email.ilike.%${filtros.search}%`
      )
    }
  }
  const { count } = await query
  return count ?? 0
}

export async function getReclamacion(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('libro_reclamaciones')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function responderReclamo(id: string, respuesta: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('libro_reclamaciones')
    .update({ respuesta, estado: 'atendido', respondido_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
