import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TrackingClient } from '@/components/tracking/TrackingClient'

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
}

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function PedidoPage({ params }: Props) {
  const { orderId } = await params

  const supabase = await createClient()

  // Verificar que el pedido existe
  const { data: pedido } = await supabase
    .from('pedidos')
    .select('order_id')
    .eq('order_id', orderId)
    .single()

  if (!pedido) notFound()

  // Obtener número de WhatsApp de config
  const { data: config } = await supabase
    .from('config')
    .select('whatsapp_numero')
    .single()

  return (
    <TrackingClient
      orderId={orderId}
      whatsappNumero={config?.whatsapp_numero ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}
    />
  )
}
