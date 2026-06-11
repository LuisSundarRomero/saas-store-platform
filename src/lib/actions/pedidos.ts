'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { CartItem } from '@/types'
import { buildWhatsAppURL } from '@/lib/utils/whatsapp'
import { enviarEmailNuevoPedido } from '@/lib/utils/email'

// Cliente admin con service role — bypasea RLS solo para operaciones de servidor
function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CreateOrderInput {
  items: CartItem[]
  clienteNombre?: string
  clienteTelefono: string
}

interface CreateOrderResult {
  orderId: string
  whatsappUrl: string
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const admin = getAdminClient()

  const total = input.items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)

  // Intentar con la función de Supabase (secuencia atómica)
  let orderId: string
  const { data: rpcData } = await admin.rpc('next_order_id')

  if (rpcData) {
    orderId = rpcData as string
  } else {
    // Fallback: timestamp único si la función no existe aún
    const ts = Date.now().toString(36).toUpperCase().slice(-5)
    const rand = Math.random().toString(36).slice(2, 4).toUpperCase()
    orderId = `ORD-${ts}${rand}`
  }

  // Generar UUID antes del insert para no necesitar SELECT después (evita RLS)
  const pedidoId = crypto.randomUUID()

  const { error: pedidoError } = await admin
    .from('pedidos')
    .insert({
      id: pedidoId,
      order_id: orderId,
      cliente_nombre: input.clienteNombre ?? null,
      cliente_telefono: input.clienteTelefono.replace(/\s/g, ''),
      total,
      estado: 'pendiente',
    })

  if (pedidoError) {
    console.error('[createOrder] error inserting pedido:', pedidoError.message)
    throw new Error('No se pudo crear el pedido')
  }

  // Insertar items con admin
  const itemsData = input.items.map((i) => ({
    pedido_id: pedidoId,
    producto_id: i.productoId,
    nombre: i.nombre,
    precio: i.precio,
    talla: i.talla || null,
    color: i.color || null,
    cantidad: i.cantidad,
    subtotal: i.precio * i.cantidad,
  }))

  await admin.from('pedido_items').insert(itemsData)

  // Config de la tienda
  const { data: config } = await admin
    .from('config')
    .select('whatsapp_numero, whatsapp_template, email_notificaciones')
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://anarchyy.pe'
  const trackingUrl = `${appUrl}/pedido/${orderId}`

  const numero = (config?.whatsapp_numero ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\s/g, '')

  const whatsappUrl = buildWhatsAppURL({
    numero,
    orderId,
    items: input.items.map((i) => ({ ...i, subtotal: i.precio * i.cantidad })),
    total,
    trackingUrl,
    template:
      config?.whatsapp_template ??
      `Hola! Quiero hacer este pedido 🦇\n\n📦 #{orderId}\n\n{productos}\n\n💰 Total: S/ {total}\n\n🔍 Rastrear pedido: {trackingLink}`,
  })

  // Enviar email de notificación (en background, no bloquea el checkout)
  if (config?.email_notificaciones) {
    enviarEmailNuevoPedido({
      to: config.email_notificaciones,
      orderId,
      clienteTelefono: input.clienteTelefono,
      items: input.items,
      total,
      trackingUrl,
    }).catch((err) => console.error('[email]', err.message))
  }

  return { orderId, whatsappUrl }
}

export async function verificarPedido(orderId: string, telefono: string) {
  // Cliente público sin manejo de sesión — la función SQL usa SECURITY DEFINER
  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase.rpc('verificar_pedido', {
    p_order_id: orderId,
    p_tel: telefono,
  })
  if (error) console.error('[verificarPedido]', error.message)
  return data ?? null
}
