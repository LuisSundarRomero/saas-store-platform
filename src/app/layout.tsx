import type { Metadata, Viewport } from 'next'
import { Anton, Inter } from 'next/font/google'
import { headers } from 'next/headers'
import Script from 'next/script'
import './globals.css'

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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://contahorro.com'

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const nombre = h.get('x-tenant-nombre') ?? 'Mi Tienda'
  const slug   = h.get('x-tenant-slug')   ?? ''
  const url    = slug ? `https://${slug}.${process.env.NEXT_PUBLIC_MAIN_DOMAIN}` : APP_URL

  return {
    metadataBase: new URL(url),
    title: {
      default: nombre,
      template: `%s | ${nombre}`,
    },
    description: `${nombre} — Tienda online. Pedidos por WhatsApp con envío a nivel nacional.`,
    authors: [{ name: nombre }],
    creator: nombre,
    openGraph: {
      type: 'website',
      locale: 'es_PE',
      url,
      siteName: nombre,
      title: nombre,
      description: `${nombre} — Tienda online. Pedidos por WhatsApp con envío a nivel nacional.`,
    },
    twitter: {
      card: 'summary_large_image',
      title: nombre,
      description: `${nombre} — Tienda online. Pedidos por WhatsApp.`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#121214',
  colorScheme: 'dark',
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { getTenant } = await import('@/lib/tenant')
  const tenant = await getTenant()
  const brandColor = tenant.color || '#E11D2E'

  return (
    <html
      lang="es"
      className={`${inter.variable} ${anton.variable} h-full dark`}
      style={{ '--color-brand': brandColor } as React.CSSProperties}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
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
      </body>
    </html>
  )
}

