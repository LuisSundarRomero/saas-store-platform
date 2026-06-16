import { createPublicClient } from '@/lib/supabase/server'
import { getTenant } from '@/lib/tenant'
import { NavbarWrapper } from '@/components/ui/NavbarWrapper'
import { Footer } from '@/components/ui/Footer'
import { AnnouncementBar } from '@/components/ui/AnnouncementBar'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [supabase, tenant] = await Promise.all([createPublicClient(), getTenant()])

  const [{ data: config }, { data: categorias }] = await Promise.all([
    supabase.from('config').select('tienda_nombre, footer_descripcion, footer_politica, whatsapp_numero, anuncio_visible, anuncio_texto, anuncio_link, anuncio_expira, footer_info1, footer_info2, footer_info3, footer_info4, footer_email, footer_tagline, redes_instagram, redes_tiktok').eq('tenant_id', tenant.id).single(),
    supabase.from('categorias').select('nombre, slug').eq('activa', true).eq('tenant_id', tenant.id).order('orden', { ascending: true }),
  ])

  const tiendaNombre   = config?.tienda_nombre      ?? 'Anarchyy.pe'
  const footerDesc     = config?.footer_descripcion ?? ''
  const footerPolitica = config?.footer_politica    ?? ''
  const whatsappNumero = config?.whatsapp_numero    ?? ''
  const footerEmail    = config?.footer_email       ?? 'contacto@anarchyy.pe'
  const footerTagline  = config?.footer_tagline     ?? ''
  const redesInstagram = config?.redes_instagram    ?? ''
  const redesTiktok    = config?.redes_tiktok       ?? ''

  // Anuncio: visible, texto y que no haya expirado
  const anuncioVisible = config?.anuncio_visible && config?.anuncio_texto
  const anuncioExpirado = config?.anuncio_expira && new Date(config.anuncio_expira) < new Date()
  const mostrarAnuncio = anuncioVisible && !anuncioExpirado

  return (
    <>
      {mostrarAnuncio && (
        <AnnouncementBar
          texto={config!.anuncio_texto}
          link={config?.anuncio_link ?? null}
          expira={config?.anuncio_expira ?? null}
        />
      )}
      <NavbarWrapper tiendaNombre={tiendaNombre} />
      <div className="flex-1">{children}</div>
      <Footer
        tiendaNombre={tiendaNombre}
        descripcion={footerDesc}
        politica={footerPolitica}
        whatsapp={whatsappNumero}
        email={footerEmail}
        tagline={footerTagline}
        instagram={redesInstagram}
        tiktok={redesTiktok}
        categorias={categorias ?? []}
        infoItems={[
          config?.footer_info1,
          config?.footer_info2,
          config?.footer_info3,
          config?.footer_info4,
        ].filter(Boolean) as string[]}
      />
    </>
  )
}
