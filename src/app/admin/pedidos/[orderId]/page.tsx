import { notFound } from 'next/navigation'
import Link from 'next/link'
import { IconArrowLeft, IconBrandWhatsapp, IconPhone } from '@tabler/icons-react'
import { getPedidoAdmin } from '@/lib/actions/admin'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { EstadoSelector } from '@/components/admin/EstadoSelector'
import { OrderTimeline } from '@/components/tracking/OrderTimeline'
import { EstadoPedido } from '@/types'

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function PedidoDetalleAdmin({ params }: Props) {
  const { orderId } = await params
  const pedido = await getPedidoAdmin(orderId)
  if (!pedido) notFound()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/pedidos"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-700">
          <IconArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">#{orderId}</h1>
          <p className="text-sm text-gray-400">{formatDate(pedido.created_at)}</p>
        </div>
        <EstadoSelector
          pedidoId={pedido.id}
          estadoActual={pedido.estado as EstadoPedido}
          clienteTelefono={pedido.cliente_telefono}
          orderId={orderId}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Productos — span 2 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Productos del pedido</h2>
          <div className="flex flex-col gap-0">
            {pedido.pedido_items?.map((item: any, i: number) => (
              <div key={item.id}
                className="flex items-start justify-between py-3 text-sm"
                style={{ borderBottom: i < pedido.pedido_items.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{item.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {[item.talla, item.color].filter(Boolean).map((v: string) => (
                      <span key={v} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {v}
                      </span>
                    ))}
                    <span className="text-xs text-gray-400">× {item.cantidad}</span>
                  </div>
                </div>
                <span className="font-bold ml-4 shrink-0" style={{ color: '#E11D2E' }}>
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-1">
            <span className="font-semibold text-gray-700">Total del pedido</span>
            <span className="text-xl font-bold" style={{ color: '#E11D2E' }}>{formatPrice(pedido.total)}</span>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="flex flex-col gap-4">

          {/* Cliente */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Cliente</h2>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <IconPhone size={15} className="text-green-600" />
              </div>
              <span className="font-mono text-sm font-medium text-gray-700">{pedido.cliente_telefono}</span>
            </div>
            <a href={`https://wa.me/${pedido.cliente_telefono}?text=${encodeURIComponent(`Hola! Te escribimos sobre tu pedido #${orderId}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}>
              <IconBrandWhatsapp size={16} />
              Escribir al cliente
            </a>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Estado del pedido</h2>
            <OrderTimeline
              estadoActual={pedido.estado as EstadoPedido}
              historial={pedido.estado_historial}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
