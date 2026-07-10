'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { CartItem } from '@/types'
import { enviarEmailNuevoPedido, enviarEmailConfirmacionCliente } from '@/lib/utils/email'
import { getTenant, esPlanPro } from '@/lib/tenant'

// Cliente admin con service role — bypasea RLS solo para operaciones de servidor
function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function descontarStockPedido(
  admin: ReturnType<typeof getAdminClient>,
  tenantId: string,
  items: CartItem[]
) {
  // Operación atómica via RPC — elimina el race condition TOCTOU del patrón
  // SELECT + UPDATE. PostgreSQL bloquea la fila durante el UPDATE, así dos
  // checkouts simultáneos nunca leen el mismo stock y no generan oversell.
  await Promise.all(
    items.map((item) =>
      admin.rpc('descontar_stock', {
        p_producto_id: item.productoId,
        p_tenant_id:   tenantId,
        p_cantidad:    item.cantidad,
      })
    )
  )
}

interface CrearPedidoConCulqiInput {
  items: CartItem[]
  clienteNombre: string
  clienteTelefono: string
  clienteEmail: string
  clienteDireccion: string
  culqiToken: string
}

type CrearPedidoConCulqiResult =
  | { success: true; orderId: string }
  | { success: false; errorType: 'card_error' | 'review' | 'order_failed' | 'generic'; error: string; chargeId?: string }

const GENERIC_PAYMENT_ERROR = 'No pudimos procesar tu pago en este momento. Por favor, intenta nuevamente en unos minutos.'

function mapCodes(codes: string[], message: string): Record<string, string> {
  return Object.fromEntries(codes.map((code) => [code, message]))
}

// Mensajes amigables para los decline_code documentados por Culqi (card_error)
const DECLINE_MESSAGES: Record<string, string> = {
  expired_card: 'Tu tarjeta está vencida. Verifica la fecha de vencimiento o usa otra tarjeta.',
  stolen_card: 'Esta tarjeta fue reportada como robada. Usa otra tarjeta.',
  lost_card: 'Esta tarjeta fue reportada como perdida. Usa otra tarjeta.',
  insufficient_funds: 'Tu tarjeta no tiene fondos suficientes. Verifica tus fondos o usa otra tarjeta.',
  contact_issuer: 'Tu banco rechazó la operación. Contáctate con tu banco o usa otra tarjeta.',
  invalid_cvv: 'El código de seguridad (CVV) ingresado es incorrecto.',
  incorrect_cvv: 'El código de seguridad (CVV) ingresado es incorrecto.',
  too_many_attempts_cvv: 'Se superó el número de intentos con el CVV. Espera unos minutos o usa otra tarjeta.',
  issuer_not_available: 'Tu banco no respondió. Intenta nuevamente en unos minutos.',
  issuer_decline_operation: 'Tu banco rechazó la operación. Intenta con otra tarjeta o contáctate con tu banco.',
  invalid_card: 'Esta tarjeta tiene restricciones para este tipo de compra. Contáctate con tu banco.',
  processing_error: 'Ocurrió un error al procesar el pago. Intenta nuevamente.',
  fraudulent: 'El banco rechazó la operación por seguridad. Usa otra tarjeta.',
  culqi_card: 'Esa es una tarjeta de prueba. Usa una tarjeta real para completar la compra.',
  soft_block: 'Tu tarjeta tiene un bloqueo temporal por reintentos. Usa otra tarjeta.',

  // Códigos del diccionario banco/adquiriente que Culqi suele devolver como decline_code real
  ...mapCodes(['DNGE0015'], 'Tu tarjeta no tiene fondos suficientes. Verifica tus fondos o usa otra tarjeta.'),
  ...mapCodes(['DNGE0052', 'DNGE0054'], 'Tu tarjeta está vencida. Verifica la fecha de vencimiento o usa otra tarjeta.'),
  ...mapCodes(['DNGE0030', 'DNGA0150', 'DNGA0151'], 'Esta tarjeta fue reportada como perdida. Usa otra tarjeta.'),
  ...mapCodes(['DNGE0031'], 'Esta tarjeta fue reportada como robada. Usa otra tarjeta.'),
  ...mapCodes(['DNGE0014', 'DNGE0051', 'DNGE0079'], 'El código de seguridad (CVV) ingresado es incorrecto.'),
  ...mapCodes(['DNGE0058', 'DNGE0073', 'DNGA0124'], 'El PIN ingresado es incorrecto.'),
  ...mapCodes(['DNGE0024', 'DNGE0025', 'DNGE0026', 'DNGE0028', 'PREV0091'], 'Tu tarjeta está bloqueada o restringida. Contáctate con tu banco o usa otra tarjeta.'),
  ...mapCodes(['DNGE0035', 'DNGE0036', 'CULQ0008'], 'Esta tarjeta no es válida para este tipo de operación. Verifica los datos o usa otra tarjeta.'),
  ...mapCodes(['DNGE0037', 'DNGE0056', 'DNGE0057', 'CULQ0001', 'CULQ0002', 'CULQ0003', 'CULQ0004'], 'Esta operación excede el límite permitido por tu tarjeta o banco. Usa otra tarjeta o contáctate con tu banco.'),
  ...mapCodes(['DNGE0003', 'DNGE0075', 'DNGE0085', 'PREV0085', 'PREV0086', 'PREV0087', 'PREV0088'], 'El banco rechazó la operación por seguridad. Usa otra tarjeta o contáctate con tu banco.'),
  ...mapCodes(['DNGA0102', 'DNGA0123', 'PREV0089'], 'Tu banco requiere una verificación adicional (3D Secure) que no pudo completarse. Intenta nuevamente.'),
  ...mapCodes(['CULQ0005', 'DNGE0005', 'DNGE0074', 'PREV0090'], 'Las compras por internet o con tarjetas internacionales están deshabilitadas para esta tarjeta. Contáctate con tu banco.'),
  ...mapCodes(['DNGA0021', 'DNGA0022', 'DNGA0024', 'DNGA0147', 'DNGE0080'], 'Tu banco no respondió. Intenta nuevamente en unos minutos.'),
  ...mapCodes(['DNGE0032', 'DNGE0089'], 'Tu banco no permite este tipo de operación con esta tarjeta. Contáctate con tu banco o usa otra tarjeta.'),
  ...mapCodes(['DNGE0055', 'DNGA0125'], 'Se superó el número de intentos permitidos. Espera unos minutos o usa otra tarjeta.'),
  ...mapCodes(['DNGE0060', 'DNGE0067', 'DNGE0068', 'DNGE0069', 'DNGE0072', 'DNGA0148'], 'La cuenta asociada a esta tarjeta es inválida. Usa otra tarjeta.'),
  ...mapCodes(['DNGA0030'], 'Esta operación parece estar duplicada. Verifica si el pago ya se realizó antes de intentar de nuevo.'),
}

// Busca el mensaje amigable usando decline_code, o como respaldo, buscando el código
// dentro de merchant_message/user_message (Culqi a veces lo embebe ahí en vez de en decline_code)
function findDeclineMessage(cargo: { decline_code?: string; merchant_message?: string; user_message?: string }): string | undefined {
  if (cargo.decline_code && DECLINE_MESSAGES[cargo.decline_code]) {
    return DECLINE_MESSAGES[cargo.decline_code]
  }

  const text = `${cargo.merchant_message ?? ''} ${cargo.user_message ?? ''}`
  for (const [code, message] of Object.entries(DECLINE_MESSAGES)) {
    if (text.includes(code)) return message
  }

  return undefined
}

function validarInputPedido(input: { clienteNombre: string; clienteEmail: string; clienteTelefono: string; clienteDireccion: string; items: CartItem[] }): string | null {
  if (!input.clienteNombre?.trim() || input.clienteNombre.length > 120) return 'Nombre inválido'
  if (!input.clienteEmail?.trim() || input.clienteEmail.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.clienteEmail)) return 'Email inválido'
  if (!input.clienteTelefono?.trim() || input.clienteTelefono.replace(/\D/g, '').length < 9) return 'Teléfono inválido'
  if (!input.clienteDireccion?.trim() || input.clienteDireccion.length < 8 || input.clienteDireccion.length > 300) return 'Dirección inválida'
  if (!input.items?.length || input.items.length > 50) return 'Carrito inválido'
  if (input.items.some((i) => i.cantidad < 1 || i.cantidad > 99 || i.precio < 0)) return 'Item inválido'
  return null
}

export async function crearPedidoConCulqi(input: CrearPedidoConCulqiInput): Promise<CrearPedidoConCulqiResult> {
  const validationError = validarInputPedido(input)
  if (validationError) return { success: false, errorType: 'generic', error: validationError }

  const admin = getAdminClient()
  const tenant = await getTenant()

  const total = input.items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)

  // Leer llaves Culqi del tenant (fallback a env vars para desarrollo)
  const { data: tenantData } = await admin
    .from('tenants')
    .select('culqi_secret_key, culqi_public_key')
    .eq('id', tenant.id)
    .single()
  const culqiSecretKey = tenantData?.culqi_secret_key ?? ''

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

  // Crear el cargo en Culqi con el token generado en el cliente
  let cargoRes: Response
  try {
    cargoRes = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${culqiSecretKey}`,
      },
      body: JSON.stringify({
        amount: total,
        currency_code: 'PEN',
        email: input.clienteEmail,
        source_id: input.culqiToken,
        description: `Pedido ${orderId}`,
        metadata: { order_id: orderId },
      }),
    })
  } catch (err) {
    console.error('[crearPedidoConCulqi] network error calling Culqi:', err)
    return { success: false, errorType: 'generic', error: GENERIC_PAYMENT_ERROR }
  }

  let cargo: Record<string, unknown> & {
    outcome?: { type?: string }
    type?: string
    decline_code?: string
    action_code?: string
    merchant_message?: string
    user_message?: string
    id?: string
  }
  try {
    cargo = await cargoRes.json()
  } catch (err) {
    console.error('[crearPedidoConCulqi] Culqi response is not JSON, status:', cargoRes.status, err)
    return { success: false, errorType: 'generic', error: GENERIC_PAYMENT_ERROR }
  }

  if (!cargoRes.ok || cargo.outcome?.type !== 'venta_exitosa') {
    console.error('[crearPedidoConCulqi] Culqi error:', cargoRes.status, cargo)

    if (cargo.type === 'card_error') {
      const message = findDeclineMessage(cargo) || cargo.user_message || GENERIC_PAYMENT_ERROR
      return { success: false, errorType: 'card_error', error: message }
    }

    if (cargo.action_code === 'REVIEW') {
      return {
        success: false,
        errorType: 'review',
        error: 'Tu banco requiere una verificación adicional para este pago. Intenta nuevamente o usa otra tarjeta.',
      }
    }

    // invalid_request_error, authentication_error, parameter_error, resource_error, api_error, limit_api_error:
    // problemas de integración/servidor, no del cliente — no exponemos merchant_message.
    return { success: false, errorType: 'generic', error: GENERIC_PAYMENT_ERROR }
  }

  // Generar UUID antes del insert para no necesitar SELECT después (evita RLS)
  const pedidoId = crypto.randomUUID()

  const { error: pedidoError } = await admin
    .from('pedidos')
    .insert({
      id: pedidoId,
      order_id: orderId,
      tenant_id: tenant.id,
      cliente_nombre: input.clienteNombre,
      cliente_telefono: input.clienteTelefono.replace(/\s/g, ''),
      cliente_email: input.clienteEmail,
      cliente_direccion: input.clienteDireccion,
      total,
      estado: 'pago_confirmado',
      metodo_pago: 'culqi',
      culqi_charge_id: cargo.id,
    })

  if (pedidoError) {
    console.error('[crearPedidoConCulqi] error inserting pedido:', pedidoError.message)
    return {
      success: false,
      errorType: 'order_failed',
      error: 'Tu pago se realizó correctamente, pero ocurrió un problema al registrar tu pedido. Contáctanos con el código de cargo para confirmarlo.',
      chargeId: cargo.id ?? '',
    }
  }

  // Insertar items con admin
  const itemsData = input.items.map((i) => ({
    pedido_id: pedidoId,
    tenant_id: tenant.id,
    producto_id: i.productoId,
    nombre: i.nombre,
    precio: i.precio,
    talla: i.talla || null,
    color: i.color || null,
    cantidad: i.cantidad,
    subtotal: i.precio * i.cantidad,
  }))

  await admin.from('pedido_items').insert(itemsData)

  // Descontar stock de cada producto (en background; no bloquea el checkout si falla)
  descontarStockPedido(admin, tenant.id, input.items).catch((err) =>
    console.error('[crearPedidoConCulqi] error actualizando stock:', err)
  )

  // Config de la tienda
  const { data: config } = await admin
    .from('config_tienda')
    .select('email_notif, tienda_nombre')
    .eq('tenant_id', tenant.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const trackingUrl = `${appUrl}/rastrear?order=${orderId}`

  // Enviar email de notificación (en background, no bloquea el checkout)
  if (config?.email_notif) {
    enviarEmailNuevoPedido({
      to: config.email_notif,
      orderId,
      clienteNombre: input.clienteNombre,
      clienteTelefono: input.clienteTelefono,
      items: input.items,
      total,
      trackingUrl,
      tiendaNombre: config.tienda_nombre ?? undefined,
      tenantSlug: tenant.slug,
    }).catch((err) => console.error('[email]', err.message))
  }

  // Confirmación al comprador — feature exclusivo Plan Pro
  if (input.clienteEmail && esPlanPro(tenant)) {
    enviarEmailConfirmacionCliente({
      to: input.clienteEmail,
      orderId,
      clienteNombre: input.clienteNombre,
      items: input.items,
      total,
      trackingUrl,
      tiendaNombre: config?.tienda_nombre ?? undefined,
      tenantSlug: tenant.slug,
    }).catch((err) => console.error('[email cliente]', err.message))
  }

  return { success: true, orderId }
}

interface CrearPedidoWhatsAppInput {
  items: CartItem[]
  clienteNombre: string
  clienteTelefono: string
  clienteEmail: string
  clienteDireccion: string
}

type CrearPedidoWhatsAppResult =
  | { success: true; orderId: string; whatsappUrl: string }
  | { success: false; error: string }

export async function crearPedidoWhatsApp(input: CrearPedidoWhatsAppInput): Promise<CrearPedidoWhatsAppResult> {
  const validationError = validarInputPedido(input)
  if (validationError) return { success: false, error: validationError }

  const admin = getAdminClient()
  const tenant = await getTenant()

  const total = input.items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)

  let orderId: string
  const { data: rpcData } = await admin.rpc('next_order_id')
  if (rpcData) {
    orderId = rpcData as string
  } else {
    const ts = Date.now().toString(36).toUpperCase().slice(-5)
    const rand = Math.random().toString(36).slice(2, 4).toUpperCase()
    orderId = `ORD-${ts}${rand}`
  }

  const pedidoId = crypto.randomUUID()

  const { error: pedidoError } = await admin.from('pedidos').insert({
    id: pedidoId,
    order_id: orderId,
    tenant_id: tenant.id,
    cliente_nombre: input.clienteNombre,
    cliente_telefono: input.clienteTelefono.replace(/\s/g, ''),
    cliente_email: input.clienteEmail,
    cliente_direccion: input.clienteDireccion,
    total,
    estado: 'pendiente',
    metodo_pago: 'whatsapp',
  })

  if (pedidoError) {
    console.error('[crearPedidoWhatsApp] error inserting pedido:', pedidoError.message)
    return { success: false, error: 'No pudimos registrar tu pedido. Intenta nuevamente.' }
  }

  const itemsData = input.items.map((i) => ({
    pedido_id: pedidoId,
    tenant_id: tenant.id,
    producto_id: i.productoId,
    nombre: i.nombre,
    precio: i.precio,
    talla: i.talla || null,
    color: i.color || null,
    cantidad: i.cantidad,
    subtotal: i.precio * i.cantidad,
  }))

  await admin.from('pedido_items').insert(itemsData)

  const { data: config } = await admin
    .from('config_tienda')
    .select('whatsapp_numero, tienda_nombre, email_notif')
    .eq('tenant_id', tenant.id)
    .single()

  const { data: msgConfig } = await admin
    .from('config_mensajes')
    .select('whatsapp_template')
    .eq('tenant_id', tenant.id)
    .single()

  const numero = (config?.whatsapp_numero ?? '').replace(/\D/g, '')

  const lineasItems = input.items
    .map((i) => {
      const extras = [i.talla, i.color].filter(Boolean).join(', ')
      return `• ${i.nombre}${extras ? ` (${extras})` : ''} x${i.cantidad} — S/${(i.precio * i.cantidad / 100).toFixed(2)}`
    })
    .join('\n')

  const totalSoles = (total / 100).toFixed(2)

  let mensaje = msgConfig?.whatsapp_template ?? ''
  if (mensaje) {
    mensaje = mensaje
      .replace(/{order_id}/g, orderId)
      .replace(/{nombre}/g, input.clienteNombre)
      .replace(/{direccion}/g, input.clienteDireccion)
      .replace(/{items}/g, lineasItems)
      .replace(/{total}/g, `S/${totalSoles}`)
  } else {
    mensaje =
      `Hola! Quiero confirmar mi pedido *${orderId}*\n\n` +
      `*Datos:*\n` +
      `Nombre: ${input.clienteNombre}\n` +
      `Dirección: ${input.clienteDireccion}\n\n` +
      `*Productos:*\n${lineasItems}\n\n` +
      `*Total: S/${totalSoles}*`
  }

  const whatsappUrl = numero
    ? `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
    : `https://wa.me/?text=${encodeURIComponent(mensaje)}`

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const trackingUrl = `${appUrl}/rastrear?order=${orderId}`

  if (config?.email_notif) {
    enviarEmailNuevoPedido({
      to: config.email_notif,
      orderId,
      clienteNombre: input.clienteNombre,
      clienteTelefono: input.clienteTelefono,
      items: input.items,
      total,
      trackingUrl,
      tiendaNombre: config.tienda_nombre ?? undefined,
      tenantSlug: tenant.slug,
    }).catch((err) => console.error('[email]', err.message))
  }

  return { success: true, orderId, whatsappUrl }
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
