import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { ProductoForm } from '@/components/admin/ProductoForm'

interface Props {
  params: Promise<{ productoId: string }>
}

export default async function ProductoFormPage({ params }: Props) {
  const { productoId } = await params
  const admin = createAdminClient()
  const tenant = await getTenant()

  const categorias = await admin
    .from('categorias')
    .select('id, nombre')
    .eq('tenant_id', tenant.id)
    .eq('activa', true)
    .order('orden')
    .then(({ data }) => data ?? [])

  if (productoId === 'nuevo') {
    return <ProductoForm categorias={categorias} />
  }

  const { data: producto } = await admin
    .from('productos')
    .select('*')
    .eq('id', productoId)
    .eq('tenant_id', tenant.id)
    .single()

  if (!producto) notFound()

  return <ProductoForm producto={producto} categorias={categorias} />
}
