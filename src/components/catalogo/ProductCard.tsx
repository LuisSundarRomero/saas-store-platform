import Image from 'next/image'
import Link from 'next/link'
import { Producto } from '@/types'
import { formatPrice } from '@/lib/utils/format'

function isNuevo(createdAt: string, dias = 14) {
  return (Date.now() - new Date(createdAt).getTime()) < 1000 * 60 * 60 * 24 * dias
}

interface ProductCardProps {
  producto: Producto
  nuevoDias?: number
}

export function ProductCard({ producto, nuevoDias = 14 }: ProductCardProps) {
  const agotado  = producto.stock !== null && producto.stock === 0
  const stockBajo = producto.stock !== null && producto.stock > 0 && producto.stock <= 5
  const imagen   = producto.imagenes?.[0]
  const imagen2  = producto.imagenes?.[1]
  const descuento = producto.precio_antes
    ? Math.round((1 - producto.precio / producto.precio_antes) * 100)
    : null
  const nuevo = producto.es_nuevo || isNuevo(producto.created_at, nuevoDias)

  return (
    <Link href={`/catalogo/${producto.slug}`} className="group flex flex-col">

      {/* Imagen */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3">
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
          <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-4xl">👟</div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {nuevo && !descuento && (
            <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              NUEVO
            </span>
          )}
          {descuento && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{descuento}%
            </span>
          )}
          {stockBajo && !agotado && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
              ¡Últimas {producto.stock}!
            </span>
          )}
        </div>

        {agotado && (
          <div className="absolute inset-0 bg-black/20 flex items-end justify-center pb-4">
            <span className="bg-white text-gray-600 text-xs font-semibold px-4 py-1.5 rounded-full">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info — limpio y directo */}
      <div className="flex flex-col gap-1 px-0.5">
        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
          {producto.nombre}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: '#EC4899' }}>
            {formatPrice(producto.precio)}
          </span>
          {producto.precio_antes && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(producto.precio_antes)}
            </span>
          )}
        </div>
      </div>

    </Link>
  )
}
