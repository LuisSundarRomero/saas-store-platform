export function validarTelefono(tel: string): string | null {
  const limpio = tel.replace(/[\s\-\+\(\)]/g, '')
  if (!limpio) return 'Ingresa tu número de celular'
  if (!/^\d+$/.test(limpio)) return 'Solo se permiten números'
  if (limpio.length !== 9) return 'El número debe tener 9 dígitos'
  return null
}

export function formatearTelefono(tel: string): string {
  // Limpia y agrega código de Perú si no tiene código de país
  const limpio = tel.replace(/[\s\-\+\(\)]/g, '')
  if (limpio.length === 9) return `51${limpio}` // número peruano sin código
  return limpio
}

export function validarEmail(email: string): string | null {
  const limpio = email.trim()
  if (!limpio) return 'Ingresa tu correo electrónico'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) return 'Ingresa un correo válido'
  return null
}

export function validarNombre(nombre: string): string | null {
  const limpio = nombre.trim()
  if (!limpio) return 'Ingresa tu nombre y apellidos'
  if (!limpio.includes(' ')) return 'Ingresa tu nombre y apellidos completos'
  return null
}

export function validarDireccion(direccion: string): string | null {
  const limpio = direccion.trim()
  if (!limpio) return 'Ingresa tu dirección exacta'
  if (limpio.length < 8) return 'Ingresa una dirección más completa (calle, número, distrito)'
  return null
}
