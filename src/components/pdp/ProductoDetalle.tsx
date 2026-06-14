'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IconArrowLeft, IconShoppingBag, IconCheck, IconBrandWhatsapp, IconX, IconZoomIn, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
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
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const addItem  = useCarrito((s) => s.addItem)
  const openCart = useCarrito((s) => s.openCart)

  useEffect(() => {
    if (!lightboxOpen) return
    document.body.style.overflow = 'hidden'
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') setImagenActual((i) => (i - 1 + producto.imagenes.length) % producto.imagenes.length)
      if (e.key === 'ArrowRight') setImagenActual((i) => (i + 1) % producto.imagenes.length)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [lightboxOpen, producto.imagenes.length])

  const agotado = producto.stock !== null && producto.stock === 0
  const stockBajo = producto.stock !== null && producto.stock > 0 && producto.stock <= 5
  const necesitaTalla = producto.tallas.length > 0
  const necesitaColor = producto.colores.length > 0
  const tallaSeleccionadaAgotada = !!tallaSeleccionada && producto.stock_tallas?.[tallaSeleccionada] === 0
  const colorSeleccionadoAgotado = !!colorSeleccionado && producto.stock_colores?.[colorSeleccionado] === 0

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
    if (agotado || tallaSeleccionadaAgotada || colorSeleccionadoAgotado) return
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
      precioAntes: producto.precio_antes ?? undefined,
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://anarchyy.pe'
    const talla = tallaSeleccionada ? `Talla: ${tallaSeleccionada}` : ''
    const color = colorSeleccionado ? `Color: ${colorSeleccionado}` : ''
    const variante = [talla, color].filter(Boolean).join(' · ')

    const imagenUrl = producto.imagenes?.[0] ?? ''
    const lineaImagen = imagenUrl ? `📸 Foto: ${imagenUrl}\n` : ''

    const mensaje = `Hola! Me interesa este producto 🦇\n\n*${producto.nombre}*\n${variante ? variante + '\n' : ''}Precio: ${formatPrice(producto.precio)}\n\n${lineaImagen}\nVer producto: ${appUrl}/catalogo/${producto.slug}`
    return `https://wa.me/${numero.replace(/\s/g, '')}?text=${encodeURIComponent(mensaje)}`
  }

  return (
    <div className="min-h-screen bg-[#1F1F22]">
      {/* Back */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <Link href="/catalogo" className="inline-flex items-center gap-1 text-sm text-[#9A9A9E] hover:text-[#F5F5F2] transition-colors">
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
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Ver imagen en tamaño completo"
                  className="group relative aspect-square lg:aspect-[4/5] bg-[#1F1F22] lg:rounded-2xl overflow-hidden w-full cursor-zoom-in"
                >
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
                      <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E11D2E' }}>
                        -{descuento}%
                      </span>
                    </div>
                  )}
                  <span className="absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full text-white opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'rgba(18,18,20,0.55)', backdropFilter: 'blur(4px)' }}>
                    <IconZoomIn size={18} />
                  </span>
                </button>
                {producto.imagenes.length > 1 && (
                  <div className="flex gap-2 mt-2 px-4 lg:px-0 overflow-x-auto">
                    {producto.imagenes.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setImagenActual(i)}
                        className="shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all"
                        style={{ border: i === imagenActual ? '2px solid #E11D2E' : '2px solid transparent', opacity: i === imagenActual ? 1 : 0.6 }}
                      >
                        <Image src={img} alt="" width={56} height={56} className="object-cover w-full h-full" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square lg:aspect-[4/5] bg-[#1F1F22] lg:rounded-2xl flex items-center justify-center text-[#3A3A3E] text-5xl">
                🖤
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col px-4 lg:px-0">
            {producto.categorias && (
              <p className="text-xs font-semibold tracking-widest uppercase text-[#9A9A9E] mb-2">
                {producto.categorias.nombre}
              </p>
            )}

            <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F2] leading-tight mb-3">
              {producto.nombre}
            </h1>

            {/* Precio */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl font-bold" style={{ color: producto.precio_antes ? '#E11D2E' : '#F5F5F2' }}>
                {formatPrice(producto.precio)}
              </span>
              {producto.precio_antes && (
                <span className="text-lg text-[#6B6B70] line-through">
                  {formatPrice(producto.precio_antes)}
                </span>
              )}
            </div>

            {/* Tallas — ANTES de la descripción para que estén visible en mobile */}
            {necesitaTalla && (
              <div id="selector-talla" className="mb-5">
                <p className="text-sm font-semibold text-[#F5F5F2] mb-3">
                  Talla {tallaSeleccionada
                    ? <span className="font-normal text-[#9A9A9E]">— {tallaSeleccionada}</span>
                    : shakeField === 'talla'
                      ? <span className="font-normal text-red-400 text-xs ml-1 animate-pulse">← Selecciona una talla</span>
                      : <span className="font-normal text-[#6B6B70] text-xs ml-1">Selecciona una</span>
                  }
                </p>
                <div className={`flex flex-wrap gap-2 ${shakeField === 'talla' ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
                  style={shakeField === 'talla' ? { outline: '2px solid #7F1D1D', borderRadius: 12, padding: '8px' } : {}}>
                  {producto.tallas.map((t) => {
                    const sel = tallaSeleccionada === t
                    const tallaAgotada = producto.stock_tallas?.[t] === 0
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => !tallaAgotada && setTallaSeleccionada(t)}
                        disabled={tallaAgotada}
                        title={tallaAgotada ? 'Talla agotada' : undefined}
                        className="min-w-[52px] min-h-[52px] px-4 rounded-xl border-2 text-sm font-semibold transition-colors"
                        style={{
                          backgroundColor: sel ? '#E11D2E' : '#161618',
                          color: tallaAgotada ? '#4A4A4E' : sel ? '#fff' : '#F5F5F2',
                          borderColor: sel ? '#E11D2E' : '#2C2C30',
                          textDecoration: tallaAgotada ? 'line-through' : 'none',
                          opacity: tallaAgotada ? 0.5 : 1,
                          touchAction: 'manipulation',
                          cursor: tallaAgotada ? 'not-allowed' : 'pointer',
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
                <p className="text-sm font-semibold text-[#F5F5F2] mb-3">
                  Color {colorSeleccionado
                    ? <span className="font-normal text-[#9A9A9E] capitalize">— {colorSeleccionado}</span>
                    : shakeField === 'color'
                      ? <span className="font-normal text-red-400 text-xs ml-1 animate-pulse">← Selecciona un color</span>
                      : <span className="font-normal text-[#6B6B70] text-xs ml-1">Selecciona uno</span>
                  }
                </p>
                <div className={`flex flex-wrap gap-2 ${shakeField === 'color' ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
                  style={shakeField === 'color' ? { outline: '2px solid #7F1D1D', borderRadius: 12, padding: '8px' } : {}}>
                  {producto.colores.map((c) => {
                    const sel = colorSeleccionado === c
                    const colorAgotado = producto.stock_colores?.[c] === 0
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => !colorAgotado && setColorSeleccionado(c)}
                        disabled={colorAgotado}
                        title={colorAgotado ? 'Color agotado' : undefined}
                        className="min-h-[52px] px-5 rounded-xl border-2 text-sm font-semibold capitalize transition-colors"
                        style={{
                          backgroundColor: sel ? '#E11D2E' : '#161618',
                          color: colorAgotado ? '#4A4A4E' : sel ? '#fff' : '#F5F5F2',
                          borderColor: sel ? '#E11D2E' : '#2C2C30',
                          textDecoration: colorAgotado ? 'line-through' : 'none',
                          opacity: colorAgotado ? 0.5 : 1,
                          touchAction: 'manipulation',
                          cursor: colorAgotado ? 'not-allowed' : 'pointer',
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
              <div className="border-t border-[#2C2C30] pt-4 mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#9A9A9E] mb-2">Descripción</p>
                <p className="text-[#9A9A9E] text-sm leading-relaxed whitespace-pre-line">{producto.descripcion}</p>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col gap-3 mt-4 pb-24 lg:pb-10">
              {/* Agregar al carrito — fijo en mobile, inline en desktop */}
              <div className="fixed bottom-0 inset-x-0 z-30 p-4 bg-[#1F1F22] border-t border-[#2C2C30] lg:static lg:p-0 lg:border-0 lg:bg-transparent">
                <div className="max-w-6xl mx-auto lg:max-w-none">
                  <BtnAgregar
                    agotado={agotado}
                    agregado={agregado}
                    onClick={handleAgregar}
                  />
                </div>
              </div>
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

      {/* Lightbox — imagen en tamaño completo */}
      {lightboxOpen && producto.imagenes.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full text-white hover:opacity-80 transition-opacity"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <IconX size={22} />
          </button>

          {producto.imagenes.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setImagenActual((i) => (i - 1 + producto.imagenes.length) % producto.imagenes.length) }}
                aria-label="Imagen anterior"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <IconChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setImagenActual((i) => (i + 1) % producto.imagenes.length) }}
                aria-label="Imagen siguiente"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <IconChevronRight size={22} />
              </button>
            </>
          )}

          <div className="relative w-full h-full max-w-5xl max-h-[85vh] m-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={producto.imagenes[imagenActual]}
              alt={producto.nombre}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {producto.imagenes.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {producto.imagenes.map((_, i) => (
                <span key={i} className="h-1.5 rounded-full transition-all duration-300 block"
                  style={{
                    width: i === imagenActual ? '18px' : '6px',
                    backgroundColor: i === imagenActual ? '#E11D2E' : 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
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
      <button disabled className="w-full py-3.5 rounded-full bg-[#1F1F22] text-[#6B6B70] font-semibold cursor-not-allowed text-sm">
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
        backgroundColor: agregado ? '#22C55E' : '#E11D2E',
        color: '#fff',
        boxShadow: agregado ? '0 4px 20px rgba(34,197,94,0.3)' : '0 4px 20px rgba(225,29,46,0.3)',
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
