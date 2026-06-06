'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IconArrowLeft, IconShoppingBag, IconCheck, IconBrandWhatsapp } from '@tabler/icons-react'
import { SizeGuide } from './SizeGuide'
import { Producto } from '@/types'
import { formatPrice } from '@/lib/utils/format'
import { useCarrito } from '@/store/carrito'
import { pushEvent } from '@/lib/utils/gtm'

interface Props {
  producto: Producto
  whatsappNumero: string
}

export function ProductoDetalle({ producto, whatsappNumero }: Props) {
  const [imagenActual, setImagenActual] = useState(0)
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string | null>(
    producto.tallas.length === 1 ? producto.tallas[0] : null
  )
  const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(
    producto.colores.length === 1 ? producto.colores[0] : null
  )
  const [agregado, setAgregado] = useState(false)
  const [shakeField, setShakeField] = useState<'talla' | 'color' | null>(null)
  const addItem  = useCarrito((s) => s.addItem)
  const openCart = useCarrito((s) => s.openCart)

  const agotado = producto.stock !== null && producto.stock === 0
  const stockBajo = producto.stock !== null && producto.stock > 0 && producto.stock <= 5
  const necesitaTalla = producto.tallas.length > 0
  const necesitaColor = producto.colores.length > 0
  const puedeAgregar =
    !agotado &&
    (!necesitaTalla || !!tallaSeleccionada) &&
    (!necesitaColor || !!colorSeleccionado)

  const descuento = producto.precio_antes
    ? Math.round((1 - producto.precio / producto.precio_antes) * 100)
    : null

  useEffect(() => {
    pushEvent('product_view', {
      product_id: producto.id,
      product_name: producto.nombre,
      product_slug: producto.slug,
      product_price: producto.precio,
      product_category: producto.categorias?.nombre,
    })
  }, [producto])

  function handleAgregar() {
    if (agotado) return
    if (necesitaTalla && !tallaSeleccionada) {
      setShakeField('talla')
      setTimeout(() => setShakeField(null), 600)
      document.getElementById('selector-talla')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (necesitaColor && !colorSeleccionado) {
      setShakeField('color')
      setTimeout(() => setShakeField(null), 600)
      document.getElementById('selector-color')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      imagen: producto.imagenes?.[0] ?? '',
      precio: producto.precio,
      talla: tallaSeleccionada ?? '',
      color: colorSeleccionado ?? '',
      cantidad: 1,
    })
    pushEvent('add_to_cart', {
      product_id: producto.id,
      product_name: producto.nombre,
      product_price: producto.precio,
      talla: tallaSeleccionada,
      color: colorSeleccionado,
    })
    openCart()
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  function buildWhatsAppDirectUrl() {
    const numero = whatsappNumero
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kuutsu-pe.vercel.app'
    const talla = tallaSeleccionada ? `Talla: ${tallaSeleccionada}` : ''
    const color = colorSeleccionado ? `Color: ${colorSeleccionado}` : ''
    const variante = [talla, color].filter(Boolean).join(' · ')

    const imagenUrl = producto.imagenes?.[0] ?? ''
    const lineaImagen = imagenUrl ? `📸 Foto: ${imagenUrl}\n` : ''

    const mensaje = `Hola! Me interesa este producto 🎀\n\n*${producto.nombre}*\n${variante ? variante + '\n' : ''}Precio: ${formatPrice(producto.precio)}\n\n${lineaImagen}\nVer producto: ${appUrl}/catalogo/${producto.slug}`
    return `https://wa.me/${numero.replace(/\s/g, '')}?text=${encodeURIComponent(mensaje)}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <Link href="/catalogo" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <IconArrowLeft size={16} />
          Volver al catálogo
        </Link>
      </div>

      {/* Layout: en mobile imagen cuadrada arriba + info abajo; en desktop lado a lado */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">

          {/* Galería */}
          <div className="mb-4 lg:mb-0">
            {producto.imagenes.length > 0 ? (
              <>
                {/* Mobile: imagen cuadrada para dejar espacio al selector */}
                <div className="relative aspect-square lg:aspect-[4/5] bg-gray-100 lg:rounded-2xl overflow-hidden">
                  <Image
                    src={producto.imagenes[imagenActual]}
                    alt={producto.nombre}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {stockBajo && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-amber-400 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        Últimas {producto.stock}
                      </span>
                    </div>
                  )}
                  {descuento && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        -{descuento}%
                      </span>
                    </div>
                  )}
                </div>
                {producto.imagenes.length > 1 && (
                  <div className="flex gap-2 mt-2 px-4 lg:px-0 overflow-x-auto">
                    {producto.imagenes.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setImagenActual(i)}
                        className="shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all"
                        style={{ border: i === imagenActual ? '2px solid #EC4899' : '2px solid transparent', opacity: i === imagenActual ? 1 : 0.6 }}
                      >
                        <Image src={img} alt="" width={56} height={56} className="object-cover w-full h-full" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square lg:aspect-[4/5] bg-gray-100 lg:rounded-2xl flex items-center justify-center text-gray-300 text-5xl">
                👟
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col px-4 lg:px-0">
            {producto.categorias && (
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                {producto.categorias.nombre}
              </p>
            )}

            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight mb-3">
              {producto.nombre}
            </h1>

            {/* Precio */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl font-bold" style={{ color: '#EC4899' }}>
                {formatPrice(producto.precio)}
              </span>
              {producto.precio_antes && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(producto.precio_antes)}
                </span>
              )}
            </div>

            {/* Tallas — ANTES de la descripción para que estén visible en mobile */}
            {necesitaTalla && (
              <div id="selector-talla" className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-800">
                    Talla {tallaSeleccionada
                      ? <span className="font-normal text-gray-500">— {tallaSeleccionada}</span>
                      : shakeField === 'talla'
                        ? <span className="font-normal text-red-500 text-xs ml-1 animate-pulse">← Selecciona una talla</span>
                        : <span className="font-normal text-gray-400 text-xs ml-1">Selecciona una</span>
                    }
                  </p>
                  <SizeGuide />
                </div>
                <div className={`flex flex-wrap gap-2 ${shakeField === 'talla' ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
                  style={shakeField === 'talla' ? { outline: '2px solid #FCA5A5', borderRadius: 12, padding: '8px' } : {}}>
                  {producto.tallas.map((t) => {
                    const sel = tallaSeleccionada === t
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTallaSeleccionada(t)}
                        className="min-w-[52px] min-h-[52px] px-4 rounded-xl border-2 text-sm font-semibold transition-colors"
                        style={{
                          backgroundColor: sel ? '#EC4899' : '#fff',
                          color: sel ? '#fff' : '#374151',
                          borderColor: sel ? '#EC4899' : '#E5E7EB',
                          touchAction: 'manipulation',
                          cursor: 'pointer',
                        }}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Colores */}
            {necesitaColor && (
              <div id="selector-color" className="mb-5">
                <p className="text-sm font-semibold text-gray-800 mb-3">
                  Color {colorSeleccionado
                    ? <span className="font-normal text-gray-500 capitalize">— {colorSeleccionado}</span>
                    : shakeField === 'color'
                      ? <span className="font-normal text-red-500 text-xs ml-1 animate-pulse">← Selecciona un color</span>
                      : <span className="font-normal text-gray-400 text-xs ml-1">Selecciona uno</span>
                  }
                </p>
                <div className={`flex flex-wrap gap-2 ${shakeField === 'color' ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
                  style={shakeField === 'color' ? { outline: '2px solid #FCA5A5', borderRadius: 12, padding: '8px' } : {}}>
                  {producto.colores.map((c) => {
                    const sel = colorSeleccionado === c
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColorSeleccionado(c)}
                        className="min-h-[52px] px-5 rounded-xl border-2 text-sm font-semibold capitalize transition-colors"
                        style={{
                          backgroundColor: sel ? '#EC4899' : '#fff',
                          color: sel ? '#fff' : '#374151',
                          borderColor: sel ? '#EC4899' : '#E5E7EB',
                          touchAction: 'manipulation',
                          cursor: 'pointer',
                        }}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Descripción — al final para no desplazar los selectores */}
            {producto.descripcion && (
              <div className="border-t border-gray-100 pt-4 mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Descripción</p>
                <p className="text-gray-500 text-sm leading-relaxed">{producto.descripcion}</p>
              </div>
            )}

            {/* CTA — inline en todos los tamaños, sin fixed/sticky */}
            <div className="flex flex-col gap-3 mt-4 pb-10">
              <BtnAgregar
                agotado={agotado}
                agregado={agregado}
                onClick={handleAgregar}
              />
              <a
                href={buildWhatsAppDirectUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 text-sm border-2 transition-colors"
                style={{ borderColor: '#25D366', color: '#25D366' }}
              >
                <IconBrandWhatsapp size={18} />
                Preguntar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface BtnProps {
  agotado: boolean
  agregado: boolean
  onClick: () => void
}

function BtnAgregar({ agotado, agregado, onClick }: BtnProps) {
  if (agotado) {
    return (
      <button disabled className="w-full py-3.5 rounded-full bg-gray-100 text-gray-400 font-semibold cursor-not-allowed text-sm">
        Agotado
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all text-sm"
      style={{
        backgroundColor: agregado ? '#10B981' : '#EC4899',
        color: '#fff',
        boxShadow: agregado ? '0 4px 20px rgba(16,185,129,0.3)' : '0 4px 20px rgba(236,72,153,0.3)',
        touchAction: 'manipulation',
      }}
    >
      {agregado
        ? <><IconCheck size={18} /> Agregado al carrito</>
        : <><IconShoppingBag size={18} /> Agregar al carrito</>
      }
    </button>
  )
}
