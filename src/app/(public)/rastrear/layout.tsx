import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rastrear pedido',
  description: 'Ingresa tu código de pedido para ver el estado de tu envío.',
}

export default function RastrearLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
