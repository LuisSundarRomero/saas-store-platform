'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTransition } from 'react'
import { IconEdit } from '@tabler/icons-react'
import { Switch } from '@/components/ui/Switch'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils/format'
import { toggleVisibilidadProducto, toggleDestacadoProducto, toggleEsNuevoProducto } from '@/lib/actions/admin'
import { IconStar, IconSparkles } from '@tabler/icons-react'

interface Props {
  productos: any[]
}

export function CatalogoAdminTable({ productos }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const destacadosCount = productos.filter((p) => p.destacado).length

  function handleToggle(id: string, visible: boolean, stock: number | null) {
    if (visible && stock !== null && stock === 0) return
    startTransition(async () => {
      await toggleVisibilidadProducto(id, visible)
      router.refresh()
    })
  }

  function handleEsNuevo(id: string, esNuevo: boolean) {
    startTransition(async () => {
      try {
        await toggleEsNuevoProducto(id, esNuevo)
        router.refresh()
      } catch (e: any) {
        alert('Error: ' + e.message)
      }
    })
  }

  function handleDestacado(id: string, destacado: boolean) {
    if (destacado && destacadosCount >= 4) return // ya controlado en server, doble check
    startTransition(async () => {
      try {
        await toggleDestacadoProducto(id, destacado)
        router.refresh()
      } catch {
        alert('Máximo 4 productos destacados permitidos')
      }
    })
  }

  if (productos.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="font-medium">No hay productos</p>
        <p className="text-sm mt-1">Crea tu primer producto</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Info destacados */}
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2.5">
        <IconStar size={15} className="text-amber-500 shrink-0" />
        <p className="text-xs text-amber-700">
          <strong>Productos destacados ({destacadosCount}/4):</strong> aparecen primero en el banner del sitio para mayor impacto.
          Máximo 4 para no saturar la vista.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-400">Producto</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-400">Categoría</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-400">Precio</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-400">Stock</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-400">Nuevo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-400">Destacado</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-400">Visible</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {productos.map((p) => {
              const agotado = p.stock !== null && p.stock === 0
              const stockBajo = p.stock !== null && p.stock > 0 && p.stock <= 5
              const toggleBloqueado = agotado && !p.visible

              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {p.imagenes?.[0] ? (
                          <Image src={p.imagenes[0]} alt={p.nombre} width={44} height={44} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-lg">📷</div>
                        )}
                      </div>
                      <span className="font-medium line-clamp-1 text-gray-800">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{p.categorias?.nombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: '#E11D2E' }}>{formatPrice(p.precio)}</span>
                    {p.precio_antes && (
                      <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(p.precio_antes)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.stock === null ? (
                      <span className="text-gray-300">—</span>
                    ) : agotado ? (
                      <span className="bg-red-50 text-red-500 text-xs font-semibold px-2 py-0.5 rounded-full">Agotado</span>
                    ) : stockBajo ? (
                      <span className="bg-amber-50 text-amber-500 text-xs font-semibold px-2 py-0.5 rounded-full">{p.stock} uds</span>
                    ) : (
                      <span className="text-gray-700">{p.stock}</span>
                    )}
                  </td>
                  {/* Etiqueta NUEVO */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEsNuevo(p.id, !p.es_nuevo)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-40"
                      style={p.es_nuevo
                        ? { backgroundColor: '#1A1A1A', color: '#fff' }
                        : { backgroundColor: '#F3F4F6', color: '#9CA3AF' }}>
                      <IconSparkles size={12} />
                      <span className="text-xs font-semibold">{p.es_nuevo ? 'NUEVO' : '—'}</span>
                    </button>
                  </td>

                  {/* Destacado */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDestacado(p.id, !p.destacado)}
                      disabled={isPending || (!p.destacado && destacadosCount >= 4)}
                      title={!p.destacado && destacadosCount >= 4 ? 'Máximo 4 destacados' : p.destacado ? 'Quitar de destacados' : 'Marcar como destacado'}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={p.destacado
                        ? { backgroundColor: '#FEF3C7', color: '#D97706' }
                        : { backgroundColor: '#F9FAFB', color: '#9CA3AF' }}>
                      <IconStar size={13} fill={p.destacado ? 'currentColor' : 'none'} />
                      <span className="text-xs font-medium">{p.destacado ? 'Destacado' : 'Normal'}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={p.visible}
                        onChange={() => handleToggle(p.id, !p.visible, p.stock)}
                        disabled={isPending || toggleBloqueado}
                        size="sm"
                      />
                      {agotado && <span className="text-xs text-gray-400">stock 0</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/catalogo/${p.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg inline-flex text-gray-400 hover:text-gray-700 transition-colors">
                      <IconEdit size={16} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
