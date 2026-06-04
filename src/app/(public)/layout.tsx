import { createClient } from '@/lib/supabase/server'
import { NavbarWrapper } from '@/components/ui/NavbarWrapper'
import { Footer } from '@/components/ui/Footer'
import { AnnouncementBar } from '@/components/ui/AnnouncementBar'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const [{ data: config }, { data: categorias }] = await Promise.all([
    supabase.from('config').select('tienda_nombre, footer_descripcion, footer_politica, whatsapp_numero, anuncio_visible, anuncio_texto, anuncio_expira, footer_info1, footer_info2, footer_info3, footer_info4').single(),
    supabase.from('categorias').select('nombre, slug').eq('activa', true).order('orden', { ascending: true }),
  ])

  const tiendaNombre   = config?.tienda_nombre      ?? 'Kuutsu.pe'
  const footerDesc     = config?.footer_descripcion ?? ''
  const footerPolitica = config?.footer_politica    ?? 'No hacemos cambios ni devoluciones 🎀'
  const whatsappNumero = config?.whatsapp_numero    ?? ''

  // Anuncio: visible, texto y que no haya expirado
  const anuncioVisible = config?.anuncio_visible && config?.anuncio_texto
  const anuncioExpirado = config?.anuncio_expira && new Date(config.anuncio_expira) < new Date()
  const mostrarAnuncio = anuncioVisible && !anuncioExpirado

  return (
    <>
      {mostrarAnuncio && (
        <AnnouncementBar
          texto={config!.anuncio_texto}
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
