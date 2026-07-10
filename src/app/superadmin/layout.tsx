import type { ReactNode } from 'react'

export const metadata = { title: 'Superadmin — Peshoop', robots: 'noindex,nofollow' }

export default function SuperadminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#0e0e10', color: '#F5F5F2' }}>
        {children}
      </body>
    </html>
  )
}
