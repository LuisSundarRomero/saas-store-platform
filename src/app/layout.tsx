import type { Metadata } from 'next'
import { Cormorant_Garamond, Josefin_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

// Ultra delicada, romántica, lujosa
const cormorant = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

// Vintage geométrico, femenino, estética coquette
const josefin = Josefin_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '600', '700'],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kuutsu.pe'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Kuutsu.pe — Zapatos coquette exclusivos',
    template: '%s | Kuutsu.pe',
  },
  description: 'Zapatos coquette exclusivos en Lima. Modelos originales de bota peluche, Mary Jane y más. Pide por WhatsApp con envío a todo Lima.',
  keywords: ['zapatos coquette', 'botas Lima', 'zapatos Lima', 'bota peluche', 'mary jane', 'kuutsu', 'moda femenina Peru'],
  authors: [{ name: 'Kuutsu.pe' }],
  creator: 'Kuutsu.pe',
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: APP_URL,
    siteName: 'Kuutsu.pe',
    title: 'Kuutsu.pe — Zapatos coquette exclusivos',
    description: 'Zapatos coquette exclusivos en Lima. Modelos originales de bota peluche, Mary Jane y más. Pide por WhatsApp.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kuutsu.pe — Zapatos coquette exclusivos',
    description: 'Zapatos coquette exclusivos en Lima. Modelos originales de bota peluche, Mary Jane y más.',
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
    <html lang="es" className={`${josefin.variable} ${cormorant.variable} h-full`} suppressHydrationWarning>
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
