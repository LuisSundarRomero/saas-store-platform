'use client'

import dynamic from 'next/dynamic'
import type { CampoCheckoutConfig } from '@/types'

const Navbar = dynamic(() => import('./Navbar').then((m) => m.Navbar), { ssr: false })

interface Props {
  tiendaNombre?: string
  logoUrl?: string
  planBasico?: boolean
  whatsappNumero?: string
  whatsappTemplate?: string
  camposCheckout?: CampoCheckoutConfig[]
}

export function NavbarWrapper({ tiendaNombre, logoUrl, planBasico, whatsappNumero, whatsappTemplate, camposCheckout }: Props) {
  return (
    <Navbar
      tiendaNombre={tiendaNombre}
      logoUrl={logoUrl}
      planBasico={planBasico}
      whatsappNumero={whatsappNumero}
      whatsappTemplate={whatsappTemplate}
      camposCheckout={camposCheckout}
    />
  )
}
