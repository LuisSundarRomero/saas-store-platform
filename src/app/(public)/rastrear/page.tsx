import { createClient } from '@/lib/supabase/server'
import { RastrearClient } from '@/components/tracking/RastrearClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rastrear Pedido',
  description: 'Consulta el estado de tu pedido ingresando tu número de orden.',
  alternates: { canonical: '/rastrear' },
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{ order?: string }>
}

export default async function RastrearPage({ searchParams }: Props) {
  const { order } = await searchParams

  const { createAdminClient } = await import('@/lib/supabase/server')
  const { getTenant } = await import('@/lib/tenant')
  const tenant = await getTenant()
  const { data: config } = await createAdminClient()
    .from('config_tienda')
    .select('whatsapp_numero')
    .eq('tenant_id', tenant.id)
    .single()

  return (
    <RastrearClient
      orderId={order}
      whatsappNumero={config?.whatsapp_numero ?? ''}
    />
  )
}
