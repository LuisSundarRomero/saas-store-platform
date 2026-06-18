import { createClient } from '@/lib/supabase/server'
import { RastrearClient } from '@/components/tracking/RastrearClient'

interface Props {
  searchParams: Promise<{ order?: string }>
}

export default async function RastrearPage({ searchParams }: Props) {
  const { order } = await searchParams

  // config tiene RLS pública — no necesita admin client
  const supabase = await createClient()
  const { data: config } = await supabase
    .from('config')
    .select('whatsapp_numero')
    .single()

  return (
    <RastrearClient
      orderId={order}
      whatsappNumero={config?.whatsapp_numero ?? ''}
    />
  )
}
