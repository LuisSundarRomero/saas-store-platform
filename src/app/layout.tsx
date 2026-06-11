import type { Metadata } from 'next'
import { Anton, Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

// Impactante, condensada — títulos, drops, branding
const anton = Anton({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
})

// Limpia y legible para fondos oscuros — cuerpo de texto
const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://anarchyy.pe'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Anarchyy.pe — Lujo oscuro / Dark Streetwear',
    template: '%s | Anarchyy.pe',
  },
  description: 'Anarchyy.pe — ropa streetwear oscura: hoodies, pantalones cargo y poleras de edición limitada. Hago lo que quiero vestir. Envíos a nivel nacional, pedidos por WhatsApp.',
  keywords: ['ropa streetwear', 'ropa gotica', 'hoodies Peru', 'dark fashion', 'anarchy', 'ropa negra', 'moda alternativa Peru'],
  authors: [{ name: 'Anarchyy.pe' }],
  creator: 'Anarchyy.pe',
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: APP_URL,
    siteName: 'Anarchyy.pe',
    title: 'Anarchyy.pe — Lujo oscuro / Dark Streetwear',
    description: 'Ropa streetwear oscura de edición limitada. Hago lo que quiero vestir. Pide por WhatsApp con envío a nivel nacional.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anarchyy.pe — Lujo oscuro / Dark Streetwear',
    description: 'Ropa streetwear oscura de edición limitada. Hago lo que quiero vestir.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${anton.variable} h-full dark`} suppressHydrationWarning>
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
