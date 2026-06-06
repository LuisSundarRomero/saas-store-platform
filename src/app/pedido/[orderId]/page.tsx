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

  // config tiene RLS pública — no necesita admin client
  const supabase = await createClient()
  const { data: config } = await supabase
    .from('config')
    .select('whatsapp_numero')
    .single()

  // No hacemos notFound() aquí: si el orderId no existe,
  // verificarPedido() devolverá null y el cliente mostrará el error.
  return (
    <TrackingClient
      orderId={orderId}
      whatsappNumero={config?.whatsapp_numero ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''}
    />
  )
}
