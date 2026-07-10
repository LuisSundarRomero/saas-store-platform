import { Resend } from 'resend'
import { CartItem } from '@/types'
import { formatPrice, formatDate } from './format'

interface NuevoPedidoEmailParams {
  to: string
  orderId: string
  clienteTelefono: string
  items: CartItem[]
  total: number
  trackingUrl: string
  tiendaNombre?: string
}

export async function enviarEmailNuevoPedido(params: NuevoPedidoEmailParams) {
  if (!process.env.RESEND_API_KEY) return // silencioso si no hay key

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { to, orderId, clienteTelefono, items, total, trackingUrl, tiendaNombre = 'Mi Tienda' } = params

  const itemsHtml = items
    .map((i) => {
      const variante = [i.talla, i.color].filter(Boolean).join(' · ')
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
            <strong>${i.nombre}</strong>
            ${variante ? `<br><span style="color:#6b7280;font-size:13px">${variante}</span>` : ''}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:center">${i.cantidad}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;color:#221A2E;font-weight:600">
            ${formatPrice(i.precio * i.cantidad)}
          </td>
        </tr>`
    })
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">

    <!-- Header -->
    <div style="background:#6C2BD9;padding:28px 32px;text-align:center">
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700">🛍️ Nuevo pedido recibido</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">${formatDate(new Date().toISOString())}</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px">

      <!-- Order ID -->
      <div style="background:#F3EDFC;border:1px solid #E4D9F7;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px">
        <p style="margin:0;color:#6C2BD9;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Código del pedido</p>
        <p style="margin:6px 0 0;font-size:28px;font-weight:800;color:#221A2E">#${orderId}</p>
      </div>

      <!-- Cliente -->
      <div style="margin-bottom:20px">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase">Cliente</p>
        <p style="margin:0;font-size:16px;font-weight:600">📱 ${clienteTelefono}</p>
      </div>

      <!-- Productos -->
      <div style="margin-bottom:20px">
        <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase">Productos</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr>
              <th style="text-align:left;padding-bottom:8px;color:#6b7280;font-size:12px">Producto</th>
              <th style="text-align:center;padding-bottom:8px;color:#6b7280;font-size:12px">Cant.</th>
              <th style="text-align:right;padding-bottom:8px;color:#6b7280;font-size:12px">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="border-top:2px solid #f3f4f6;margin-top:12px;padding-top:12px;display:flex;justify-content:space-between">
          <strong>Total</strong>
          <strong style="color:#6C2BD9;font-size:18px">${formatPrice(total)}</strong>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-top:24px">
        <a href="${trackingUrl}"
          style="display:inline-block;background:#6C2BD9;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:9999px;font-weight:600;font-size:14px">
          Ver pedido en el admin
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #f3f4f6">
      <p style="margin:0;font-size:12px;color:#9ca3af">${tiendaNombre} · Notificación automática de pedido</p>
    </div>

  </div>
</body>
</html>`

  const { data, error } = await resend.emails.send({
    from: `${tiendaNombre} <pedidos@peshoop.com>`,
    to,
    subject: `🛍️ Nuevo pedido #${orderId} — ${formatPrice(total)}`,
    html,
  })

  if (error) {
    console.error('[email] Resend error:', JSON.stringify(error))
    throw new Error(error.message)
  }

  console.log('[email] Enviado OK — id:', data?.id, '→', to)
}

