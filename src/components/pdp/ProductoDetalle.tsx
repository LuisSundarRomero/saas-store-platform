'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IconArrowLeft, IconShoppingBag, IconCheck, IconBrandWhatsapp } from '@tabler/icons-react'
import { Producto } from '@/types'
import { formatPrice } from '@/lib/utils/format'
import { useCarrito } from '@/store/carrito'
import { pushEvent } from '@/lib/utils/gtm'
import { ImageSlider } from '@/components/ui/ImageSlider'

interface Props {
  producto: Producto
  whatsappNumero: string
}

export function ProductoDetalle({ producto, whatsappNumero }: Props) {
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Back */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <Link href="/catalogo" className="inline-flex items-center gap-1 text-sm transition-colors"
          style={{ color: 'var(--color-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}>

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
              <ImageSlider
                mode="product"
                slides={producto.imagenes.map((src) => ({ src, alt: producto.nombre }))}
                discountBadge={descuento ?? undefined}
                stockBadge={stockBajo ? (producto.stock ?? undefined) : undefined}
              />
            ) : (
              <div className="aspect-square lg:aspect-[4/5] lg:rounded-2xl flex items-center justify-center text-5xl"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-border)' }}>
                🖤
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col px-4 lg:px-0">
            {producto.categorias && (
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--color-muted)' }}>
                {producto.categorias.nombre}
              </p>
            )}

            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight mb-3" style={{ color: 'var(--color-ink)' }}>
              {producto.nombre}
            </h1>

            {/* Precio */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl font-bold" style={{ color: producto.precio_antes ? 'var(--color-brand)' : 'var(--color-ink)' }}>
                {formatPrice(producto.precio)}
              </span>
              {producto.precio_antes && (
                <span className="text-lg line-through" style={{ color: 'var(--color-muted)' }}>
                  {formatPrice(producto.precio_antes)}
                </span>
              )}
            </div>

            {/* Tallas — ANTES de la descripción para que estén visible en mobile */}
            {necesitaTalla && (
              <div id="selector-talla" className="mb-5">
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>
                  Talla {tallaSeleccionada
                    ? <span className="font-normal" style={{ color: 'var(--color-muted)' }}>— {tallaSeleccionada}</span>
                    : shakeField === 'talla'
                      ? <span className="font-normal text-red-400 text-xs ml-1 animate-pulse">← Selecciona una talla</span>
                      : <span className="font-normal text-xs ml-1" style={{ color: 'var(--color-muted)' }}>Selecciona una</span>
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
                          backgroundColor: sel ? 'var(--color-brand)' : 'var(--color-surface)',
                          color: tallaAgotada ? 'var(--color-muted)' : sel ? '#fff' : 'var(--color-ink)',
                          borderColor: sel ? 'var(--color-brand)' : 'var(--color-border)',
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
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>
                  Color {colorSeleccionado
                    ? <span className="font-normal capitalize" style={{ color: 'var(--color-muted)' }}>— {colorSeleccionado}</span>
                    : shakeField === 'color'
                      ? <span className="font-normal text-red-400 text-xs ml-1 animate-pulse">← Selecciona un color</span>
                      : <span className="font-normal text-xs ml-1" style={{ color: 'var(--color-muted)' }}>Selecciona uno</span>
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
                          backgroundColor: sel ? 'var(--color-brand)' : 'var(--color-surface)',
                          color: colorAgotado ? 'var(--color-muted)' : sel ? '#fff' : 'var(--color-ink)',
                          borderColor: sel ? 'var(--color-brand)' : 'var(--color-border)',
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
              <div className="border-t pt-4 mb-5" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>Descripción</p>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-muted)' }}>{producto.descripcion}</p>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col gap-3 mt-4 pb-24 lg:pb-10">
              {/* Agregar al carrito — fijo en mobile, inline en desktop */}
              <div className="fixed bottom-0 inset-x-0 z-30 p-4 border-t lg:static lg:p-0 lg:border-transparent"
                style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
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
      <button disabled className="w-full py-3.5 rounded-full font-semibold cursor-not-allowed text-sm"
        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-muted)' }}>
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
        backgroundColor: agregado ? '#22C55E' : 'var(--color-brand)',
        color: '#fff',
        boxShadow: agregado ? '0 4px 20px rgba(34,197,94,0.3)' : '0 4px 20px var(--color-brand-glow)',
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

