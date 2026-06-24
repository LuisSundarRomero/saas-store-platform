import { createAdminClient } from '@/lib/supabase/server'
import { getTenant, esPlanPro } from '@/lib/tenant'
import { NavbarWrapper } from '@/components/ui/NavbarWrapper'
import { Footer } from '@/components/ui/Footer'
import { AnnouncementBar } from '@/components/ui/AnnouncementBar'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant()
  const admin  = createAdminClient()

  const [{ data: ct }, { data: ca }, { data: cf }, { data: categorias }, { data: cm }] = await Promise.all([
    admin.from('config_tienda').select('*').eq('tenant_id', tenant.id).single(),
    admin.from('config_anuncio').select('*').eq('tenant_id', tenant.id).single(),
    admin.from('config_footer').select('*').eq('tenant_id', tenant.id).single(),
    admin.from('categorias').select('nombre, slug').eq('activa', true).eq('tenant_id', tenant.id).order('orden', { ascending: true }),
    admin.from('config_mensajes').select('whatsapp_template').eq('tenant_id', tenant.id).single(),
  ])

  const tiendaNombre      = ct?.tienda_nombre ?? tenant.nombre
  const whatsappNumero    = ct?.whatsapp_numero ?? ''
  const whatsappTemplate  = cm?.whatsapp_template ?? ''
  const planBasico        = !esPlanPro(tenant)

  const mostrarAnuncio = ca?.visible && ca?.texto && !(ca.expira && new Date(ca.expira) < new Date())

  return (
    <>
      {mostrarAnuncio && (
        <AnnouncementBar
          texto={ca!.texto}
          link={ca?.link ?? null}
          expira={ca?.expira ?? null}
        />
      )}
      <NavbarWrapper
        tiendaNombre={tiendaNombre}
        logoUrl={tenant.logo}
        planBasico={planBasico}
        whatsappNumero={whatsappNumero}
        whatsappTemplate={whatsappTemplate}
      />
      <div className="flex-1">{children}</div>
      <Footer
        tiendaNombre={tiendaNombre}
        logoUrl={tenant.logo}
        descripcion={cf?.descripcion ?? ''}
        politica={cf?.politica ?? ''}
        whatsapp={whatsappNumero}
        email={cf?.email || ct?.email_notif || ''}
        tagline={cf?.tagline ?? ''}
        instagram={cf?.instagram ?? ''}
        tiktok={cf?.tiktok ?? ''}
        categorias={categorias ?? []}
        infoItems={[cf?.info1, cf?.info2, cf?.info3, cf?.info4].filter(Boolean) as string[]}
      />
    </>
  )
}
