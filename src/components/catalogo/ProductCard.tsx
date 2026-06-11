import Image from 'next/image'
import Link from 'next/link'
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
    <Link href={`/catalogo/${producto.slug}`} className="group flex flex-col">

      {/* Imagen */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#1F1F22] mb-3">
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
          <div className="absolute inset-0 flex items-center justify-center text-[#3A3A3E] text-4xl">🖤</div>
        )}

        {/* Badge descuento — izquierda */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {descuento && (
            <span className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E11D2E' }}>
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

        {/* Badge NUEVO — derecha */}
        {nuevo && (
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5F5F2', color: '#0B0B0C' }}>
              NUEVO
            </span>
          </div>
        )}

        {agotado && (
          <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-4">
            <span className="text-[10px] font-semibold px-4 py-1.5 rounded-full" style={{ backgroundColor: '#1F1F22', color: '#9A9A9E' }}>
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info — limpio y directo */}
      <div className="flex flex-col gap-1 px-0.5">
        <p className="text-sm font-medium text-[#F5F5F2] line-clamp-2 leading-snug">
          {producto.nombre}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: '#E11D2E' }}>
            {formatPrice(producto.precio)}
          </span>
          {producto.precio_antes && (
            <span className="text-xs text-[#6B6B70] line-through">
              {formatPrice(producto.precio_antes)}
            </span>
          )}
        </div>
      </div>

    </Link>
  )
}
