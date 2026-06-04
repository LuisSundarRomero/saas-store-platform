'use client'

import dynamic from 'next/dynamic'

const Navbar = dynamic(() => import('./Navbar').then((m) => m.Navbar), { ssr: false })

interface Props {
  tiendaNombre?: string
}

export function NavbarWrapper({ tiendaNombre }: Props) {
  return <Navbar tiendaNombre={tiendaNombre} />
}
