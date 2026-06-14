'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconArrowRight, IconArrowLeft } from '@tabler/icons-react'
import { useCarrito } from '@/store/carrito'
import { validarTelefono, validarEmail, validarNombre, validarDireccion } from '@/lib/utils/checkout'
import { pushEvent } from '@/lib/utils/gtm'
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper'
import { OrderSummary } from '@/components/checkout/OrderSummary'

export default function CheckoutInformacionPage() {
  const router = useRouter()
  const items = useCarrito((s) => s.items)
  const total = useCarrito((s) => s.total)
  const itemCount = useCarrito((s) => s.itemCount)
  const checkoutInfo = useCarrito((s) => s.checkoutInfo)
  const setCheckoutInfo = useCarrito((s) => s.setCheckoutInfo)

  const [nombre, setNombre] = useState(checkoutInfo.nombre)
  const [email, setEmail] = useState(checkoutInfo.email)
  const [telefono, setTelefono] = useState(checkoutInfo.telefono)
  const [direccion, setDireccion] = useState(checkoutInfo.direccion)
  const [errores, setErrores] = useState<{ nombre?: string; email?: string; telefono?: string; direccion?: string }>({})

  useEffect(() => {
    if (items.length === 0) router.replace('/catalogo')
  }, [items.length, router])

  useEffect(() => {
    pushEvent('begin_checkout', { total: total(), items_count: itemCount() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (items.length === 0) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errorNombre = validarNombre(nombre)
    const errorEmail = validarEmail(email)
    const errorTelefono = validarTelefono(telefono)
    const errorDireccion = validarDireccion(direccion)

    if (errorNombre || errorEmail || errorTelefono || errorDireccion) {
      setErrores({
        nombre: errorNombre ?? undefined,
        email: errorEmail ?? undefined,
        telefono: errorTelefono ?? undefined,
        direccion: errorDireccion ?? undefined,
      })
      return
    }

    setCheckoutInfo({ nombre: nombre.trim(), email: email.trim(), telefono, direccion: direccion.trim() })
    router.push('/checkout/pago')
  }

  return (
    <main className="min-h-screen px-4 py-10 bg-[#1F1F22]">
      <div className="max-w-4xl mx-auto">
        <CheckoutStepper currentStep={1} />

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="order-2 lg:order-1">
            <h1 className="text-2xl font-display text-[#F5F5F2] mb-1">Tus datos</h1>
            <p className="text-sm text-[#9A9A9E] mb-6">
              Los usaremos para confirmarte el pedido y coordinar la entrega.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6B6B70] uppercase tracking-wide px-1">
                  Nombre y apellidos
                </label>
                <input
                  type="text"
                  placeholder="Ej: María Pérez García"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value)
                    setErrores((prev) => ({ ...prev, nombre: undefined }))
                  }}
                  onBlur={() => setErrores((prev) => ({ ...prev, nombre: validarNombre(nombre) ?? undefined }))}
                  className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none text-[#F5F5F2] bg-[#1F1F22] transition-colors"
                  style={{ borderColor: errores.nombre ? '#EF4444' : '#2C2C30' }}
                />
                {errores.nombre && (
                  <p className="text-xs font-medium" style={{ color: '#EF4444' }}>
                    {errores.nombre}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6B6B70] uppercase tracking-wide px-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  inputMode="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrores((prev) => ({ ...prev, email: undefined }))
                  }}
                  onBlur={() => setErrores((prev) => ({ ...prev, email: validarEmail(email) ?? undefined }))}
                  className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none text-[#F5F5F2] bg-[#1F1F22] transition-colors"
                  style={{ borderColor: errores.email ? '#EF4444' : '#2C2C30' }}
                />
                {errores.email && (
                  <p className="text-xs font-medium" style={{ color: '#EF4444' }}>
                    {errores.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6B6B70] uppercase tracking-wide px-1">
                  Tu número de celular
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="987654321"
                  value={telefono}
                  onChange={(e) => {
                    setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))
                    setErrores((prev) => ({ ...prev, telefono: undefined }))
                  }}
                  onBlur={() => setErrores((prev) => ({ ...prev, telefono: validarTelefono(telefono) ?? undefined }))}
                  className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none text-[#F5F5F2] bg-[#1F1F22] transition-colors font-mono"
                  style={{ borderColor: errores.telefono ? '#EF4444' : '#2C2C30' }}
                />
                {errores.telefono ? (
                  <p className="text-xs font-medium" style={{ color: '#EF4444' }}>
                    {errores.telefono}
                  </p>
                ) : (
                  <p className="text-xs text-[#6B6B70]">
                    9 dígitos, sin código de país (ej: 987654321)
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#6B6B70] uppercase tracking-wide px-1">
                  Dirección exacta
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av. Larco 123, dpto 4B, Miraflores"
                  value={direccion}
                  onChange={(e) => {
                    setDireccion(e.target.value)
                    setErrores((prev) => ({ ...prev, direccion: undefined }))
                  }}
                  onBlur={() => setErrores((prev) => ({ ...prev, direccion: validarDireccion(direccion) ?? undefined }))}
                  className="w-full border-2 rounded-2xl px-4 py-3 text-sm outline-none text-[#F5F5F2] bg-[#1F1F22] transition-colors"
                  style={{ borderColor: errores.direccion ? '#EF4444' : '#2C2C30' }}
                />
                {errores.direccion ? (
                  <p className="text-xs font-medium" style={{ color: '#EF4444' }}>
                    {errores.direccion}
                  </p>
                ) : (
                  <p className="text-xs text-[#6B6B70]">
                    Incluye calle, número, distrito y referencias para la entrega
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-5 py-3.5 rounded-full border border-[#2C2C30] text-[#9A9A9E] hover:bg-[#161618] hover:text-[#F5F5F2] transition-colors order-2 sm:order-1"
                >
                  <IconArrowLeft size={16} />
                  Seguir comprando
                </Link>
                <button
                  type="submit"
                  className="flex-1 text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition-opacity order-1 sm:order-2"
                  style={{ backgroundColor: '#E11D2E' }}
                >
                  Continuar al pago
                  <IconArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>

          <div className="order-1 lg:order-2">
            <OrderSummary />
          </div>
        </div>
      </div>
    </main>
  )
}
