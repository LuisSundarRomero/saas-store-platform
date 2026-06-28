import Link from 'next/link'
import { getTenants, logoutSuperadmin } from '@/lib/actions/superadmin'
import { TenantToggle } from './TenantToggle'

export const dynamic = 'force-dynamic'

const ETAPA_COLORS: Record<string, string> = {
  demo:        '#6B6B70',
  desarrollo:  '#f59e0b',
  pruebas:     '#6366f1',
  pago:        '#10b981',
  produccion:  '#E11D2E',
}

export default async function SuperadminPage() {
  const tenants = await getTenants()

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0e0e10' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#F5F5F2' }}>Superadmin</span>
          <span style={{ fontSize: 11, color: '#6B6B70', backgroundColor: '#1a1a1c', padding: '2px 8px', borderRadius: 999 }}>
            {tenants.length} tiendas
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/superadmin/tenants/nueva"
            style={{ backgroundColor: '#E11D2E', color: '#fff', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            + Nueva tienda
          </Link>
          <form action={logoutSuperadmin}>
            <button type="submit" style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#9A9A9E', padding: '8px 14px', borderRadius: 10, fontSize: 12, cursor: 'pointer' }}>
              Salir
            </button>
          </form>
        </div>
      </nav>

      {/* Table */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <div style={{ backgroundColor: '#161618', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Tienda', 'Slug', 'Plan', 'Etapa', 'Activo', 'Creado'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B6B70', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map((t: any) => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: t.color_primario || '#333', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F2', margin: 0 }}>{t.nombre}</p>
                        <a href={`https://${t.slug}.contahorro.com`} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 11, color: '#6B6B70', textDecoration: 'none' }}>
                          {t.slug}.contahorro.com ↗
                        </a>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <code style={{ fontSize: 12, color: '#9A9A9E', backgroundColor: '#1a1a1c', padding: '2px 8px', borderRadius: 6 }}>{t.slug}</code>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {t.planes ? (
                      <span style={{ fontSize: 11, fontWeight: 600, color: t.planes.color || '#6366f1', backgroundColor: `${t.planes.color || '#6366f1'}20`, padding: '3px 8px', borderRadius: 999 }}>
                        {t.planes.label}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#6B6B70' }}>Sin plan</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: ETAPA_COLORS[t.etapa] || '#6B6B70', backgroundColor: `${ETAPA_COLORS[t.etapa] || '#6B6B70'}18`, padding: '3px 8px', borderRadius: 999 }}>
                      {t.etapa || 'demo'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <TenantToggle id={t.id} activo={t.activo} />
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: '#6B6B70' }}>
                    {new Date(t.created_at).toLocaleDateString('es-PE')}
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#6B6B70', fontSize: 13 }}>
                    No hay tiendas registradas. <Link href="/superadmin/tenants/nueva" style={{ color: '#E11D2E' }}>Crear la primera →</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
