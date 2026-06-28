'use client'

import dynamic from 'next/dynamic'

const Navbar = dynamic(() => import('./Navbar').then((m) => m.Navbar), { ssr: false })

interface Props {
  tiendaNombre?: string
  logoUrl?: string
  planBasico?: boolean
  whatsappNumero?: string
  whatsappTemplate?: string
}

export function NavbarWrapper({ tiendaNombre, logoUrl, planBasico, whatsappNumero, whatsappTemplate }: Props) {
  return (
    <Navbar
      tiendaNombre={tiendaNombre}
      logoUrl={logoUrl}
      planBasico={planBasico}
      whatsappNumero={whatsappNumero}
      whatsappTemplate={whatsappTemplate}
    />
  )
}
