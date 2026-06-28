import { getPlanes } from '@/lib/actions/superadmin'
import { NuevaTiendaForm } from './NuevaTiendaForm'

export default async function NuevaTiendaPage() {
  const planes = await getPlanes()
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0e0e10' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <a href="/superadmin" style={{ color: '#6B6B70', fontSize: 13, textDecoration: 'none' }}>← Volver</a>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F5F5F2', marginTop: 12, marginBottom: 4 }}>Nueva tienda</h1>
          <p style={{ fontSize: 13, color: '#6B6B70', margin: 0 }}>Crea un nuevo tenant y asigna un usuario administrador</p>
        </div>
        <NuevaTiendaForm planes={planes} />
      </div>
    </main>
  )
}
