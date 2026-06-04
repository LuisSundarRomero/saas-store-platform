import { CartItem } from '@/types'

interface WhatsAppParams {
  numero: string
  orderId: string
  items: (CartItem & { subtotal: number })[]
  total: number // centavos
  trackingUrl: string
  template: string
}

export function buildWhatsAppURL({
  numero,
  orderId,
  items,
  total,
  trackingUrl,
  template,
}: WhatsAppParams): string {
  const productos = items
    .map((i) => {
      const variante = [i.talla, i.color].filter(Boolean).join(', ')
      const linea = `• ${i.cantidad}x ${i.nombre}`
      const detalles = variante ? `  _${variante}_ — S/ ${(i.subtotal / 100).toFixed(0)}` : `  S/ ${(i.subtotal / 100).toFixed(0)}`
      return `${linea}\n${detalles}`
    })
    .join('\n')

  // Reemplaza \n literales (del template guardado en DB) por saltos de línea reales
  const templateLimpio = template.replace(/\\n/g, '\n')

  const mensaje = templateLimpio
    .replace('{orderId}', orderId)
    .replace('{productos}', productos)
    .replace('{total}', (total / 100).toFixed(0))
    .replace('{trackingLink}', trackingUrl)

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}
