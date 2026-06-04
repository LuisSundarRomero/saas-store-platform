import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductoForm } from '@/components/admin/ProductoForm'

interface Props {
  params: Promise<{ productoId: string }>
}

export default async function ProductoFormPage({ params }: Props) {
  const { productoId } = await params
  const supabase = await createClient()

  const categorias = await supabase
    .from('categorias')
    .select('id, nombre')
    .eq('activa', true)
    .order('orden')
    .then(({ data }) => data ?? [])

  if (productoId === 'nuevo') {
    return <ProductoForm categorias={categorias} />
  }

  const { data: producto } = await supabase
    .from('productos')
    .select('*')
    .eq('id', productoId)
    .single()

  if (!producto) notFound()

  return <ProductoForm producto={producto} categorias={categorias} />
}
