import type { Metadata, Viewport } from 'next'
import { Anton, Inter, Plus_Jakarta_Sans, Comfortaa } from 'next/font/google'
import { headers } from 'next/headers'
import Script from 'next/script'
import { FontLoader } from '@/components/ui/FontLoader'
import './globals.css'

export async function generateViewport(): Promise<Viewport> {
  const h = await headers()
  const color = h.get('x-tenant-color') ?? '#121214'
  const theme = h.get('x-tenant-theme') ?? 'dark'
  return {
    themeColor: color,
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  }
}

const anton = Anton({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
})

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'],
})

const comfortaa = Comfortaa({
  variable: '--font-comfortaa',
  subsets: ['latin'],
  display: 'swap',
  weight: ['700'],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://peshoop.com'

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const isPlatform = h.get('x-is-platform') === 'true'
  const nombre = h.get('x-tenant-nombre') ?? 'Mi Tienda'
  const slug   = h.get('x-tenant-slug')   ?? ''
  const logo   = h.get('x-tenant-logo')   ?? ''
  const url    = slug ? `https://${slug}.${process.env.NEXT_PUBLIC_MAIN_DOMAIN}` : APP_URL

  // ── Metadata específica para la platform landing (peshoop.com) ──
  if (isPlatform || !slug) {
    const PLATFORM_TITLE = 'Peshoop — Tu tienda online lista en un día'
    const PLATFORM_DESC  = 'Crea tu tienda online para ropa en minutos. Recibe pedidos por WhatsApp y cobra con tarjeta. Sin complicaciones. Desde S/69/mes. Para negocios peruanos.'
    return {
      metadataBase: new URL(APP_URL),
      title: PLATFORM_TITLE,
      description: PLATFORM_DESC,
      keywords: ['tienda online peru', 'vender ropa online', 'tienda whatsapp', 'ecommerce peru', 'peshoop', 'catalogo online', 'cobrar con tarjeta peru'],
      authors: [{ name: 'Luis Romero', url: 'https://linkedin.com/in/luis-romero-frontend' }],
      creator: 'Luis Romero',
      publisher: 'Peshoop',
      icons: {
        icon: [{ url: '/favicon.svg' }, { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }],
        apple: { url: '/apple-touch-icon.png' },
        shortcut: '/favicon.svg',
      },
      openGraph: {
        type: 'website',
        locale: 'es_PE',
        url: APP_URL,
        siteName: 'Peshoop',
        title: PLATFORM_TITLE,
        description: PLATFORM_DESC,
        images: [{ url: `${APP_URL}/luis-romero.jpg`, width: 400, height: 400, alt: 'Luis Romero — Fundador de Peshoop' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: PLATFORM_TITLE,
        description: PLATFORM_DESC,
        images: [`${APP_URL}/luis-romero.jpg`],
        creator: '@peshoop',
      },
      robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
      alternates: { canonical: APP_URL },
    }
  }

  // ── Metadata por tenant ──
  const tenantBase = `/tenants/${slug}`
  const iconUrl   = logo || `${tenantBase}/favicon.svg`
  const icon96    = `${tenantBase}/favicon-96x96.png`
  const iconApple = logo || `${tenantBase}/apple-touch-icon.png`

  return {
    metadataBase: new URL(url),
    title: { default: nombre, template: `%s | ${nombre}` },
    description: `${nombre} — Tienda online. Pedidos por WhatsApp con envío a nivel nacional.`,
    authors: [{ name: nombre }],
    creator: nombre,
    icons: {
      icon: [{ url: iconUrl }, { url: icon96, sizes: '96x96', type: 'image/png' }],
      apple: { url: iconApple },
      shortcut: iconUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'es_PE',
      url,
      siteName: nombre,
      title: nombre,
      description: `${nombre} — Tienda online. Pedidos por WhatsApp con envío a nivel nacional.`,
      images: logo ? [{ url: logo }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: nombre,
      description: `${nombre} — Tienda online. Pedidos por WhatsApp.`,
      images: logo ? [logo] : [],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: url },
  }
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { getTenant } = await import('@/lib/tenant')
  const tenant = await getTenant()
  const brandColor  = tenant.color       || '#E11D2E'
  const fontDisplay = tenant.fontDisplay || ''
  const fontBody    = tenant.fontBody    || ''
  const theme       = tenant.theme       || 'dark'

  // Google Fonts URL para fuentes personalizadas por tenant
  const customFonts = [fontDisplay, fontBody].filter(f => f && f !== 'Anton' && f !== 'Inter')
  const googleFontsUrl = customFonts.length > 0
    ? `https://fonts.googleapis.com/css2?${customFonts.map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700`).join('&')}&display=swap`
    : null

  const cssVarOverrides: Record<string, string> = { '--color-brand': brandColor }
  if (fontDisplay) cssVarOverrides['--font-display'] = `'${fontDisplay}', serif`
  if (fontBody)    cssVarOverrides['--font-sans']    = `'${fontBody}', sans-serif`

  return (
    <html
      lang="es"
      className={`${inter.variable} ${anton.variable} ${jakarta.variable} ${comfortaa.variable} h-full${theme === 'dark' ? ' dark' : ''}`}
      data-theme={theme}
      style={cssVarOverrides as React.CSSProperties}
      suppressHydrationWarning
    >
      <head>
        {GTM_ID && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased" suppressHydrationWarning>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {children}
        {googleFontsUrl && <FontLoader url={googleFontsUrl} />}
      </body>
    </html>
  )
}

