import Image from 'next/image'
import Link from 'next/link'
import { IconSkull } from '@tabler/icons-react'
import { Producto } from '@/types'
import { formatPrice } from '@/lib/utils/format'

interface ProductCardProps {
  producto: Producto
}

export function ProductCard({ producto }: ProductCardProps) {
  const agotado  = producto.stock !== null && producto.stock === 0
  const stockBajo = producto.stock !== null && producto.stock > 0 && producto.stock <= 5
  const imagen   = producto.imagenes?.[0]
  const imagen2  = producto.imagenes?.[1]
  const descuento = producto.precio_antes
    ? Math.round((1 - producto.precio / producto.precio_antes) * 100)
    : null
  const nuevo = producto.es_nuevo

  return (
    <Link href={`/catalogo/${producto.slug}`} className="group flex flex-col transition-transform duration-300 hover:-translate-y-1">

      {/* Imagen */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--color-surface)] mb-3 ring-1 ring-transparent transition-all duration-300 group-hover:ring-[var(--color-brand)]/40 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
        {imagen ? (
          <>
            <Image
              src={imagen}
              alt={producto.nombre}
              fill
              className={`object-cover transition-opacity duration-500 ${imagen2 ? 'group-hover:opacity-0' : 'group-hover:scale-105 transition-transform duration-500'}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {imagen2 && (
              <Image
                src={imagen2}
                alt={producto.nombre}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--color-border)] text-4xl">🖤</div>
        )}

        {/* Badge descuento */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {descuento && (
            <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-brand)' }}>
              -{descuento}%
            </span>
          )}
          {stockBajo && !agotado && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#3A2A0A', color: '#F59E0B' }}>
              ¡Últimas {producto.stock}!
            </span>
          )}
        </div>

        {/* Badge NUEVO */}
        {nuevo && (
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-bg)' }}>
              NUEVO
            </span>
          </div>
        )}

        {agotado && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
            <IconSkull size={28} stroke={1.5} style={{ color: 'var(--color-muted)' }} />
            <span className="text-[10px] font-semibold px-4 py-1.5 rounded-full"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-muted)' }}>
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 px-0.5">
        <p className="text-sm font-medium text-[var(--color-ink)] line-clamp-2 leading-snug">
          {producto.nombre}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: producto.precio_antes ? 'var(--color-brand)' : 'var(--color-ink)' }}>
            {formatPrice(producto.precio)}
          </span>
          {producto.precio_antes && (
            <span className="text-xs text-[var(--color-muted)] line-through">
              {formatPrice(producto.precio_antes)}
            </span>
          )}
        </div>
      </div>

    </Link>
  )
}
