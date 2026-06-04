export function formatPrice(centavos: number, moneda = 'S/'): string {
  return `${moneda} ${(centavos / 100).toFixed(0)}`
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  // Formato manual sin locale para evitar hydration mismatch (Node vs browser)
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const time = `${h}:${m}`

  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) return `Hoy ${time}`
  if (isYesterday) return `Ayer ${time}`

  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${date.getDate()} ${meses[date.getMonth()]} ${date.getFullYear()}, ${time}`
}

export function generateOrderId(seq: number): string {
  return `ORD-${String(seq).padStart(3, '0')}`
}
