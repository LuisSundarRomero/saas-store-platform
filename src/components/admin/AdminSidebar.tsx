'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  IconShoppingCart, IconLayoutGrid, IconChartBar,
  IconSettings, IconLogout, IconTag
} from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin/pedidos',       label: 'Pedidos',       icon: IconShoppingCart },
  { href: '/admin/catalogo',      label: 'Catálogo',      icon: IconLayoutGrid },
  { href: '/admin/categorias',    label: 'Categorías',    icon: IconTag },
  { href: '/admin/estadisticas',  label: 'Estadísticas',  icon: IconChartBar },
  { href: '/admin/configuracion', label: 'Config',        icon: IconSettings },
]

interface SidebarProps {
  tiendaNombre?: string
}

export function AdminSidebar({ tiendaNombre = 'Kuutsu.pe' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      {/* ── SIDEBAR desktop ── */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col h-screen bg-white border-r border-gray-100 sticky top-0">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="font-serif font-bold text-xl" style={{ color: '#EC4899' }}>
            {tiendaNombre}
          </span>
          <p className="text-[11px] text-gray-400 mt-0.5 font-medium uppercase tracking-wider">
            Panel Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={
                  active
                    ? { backgroundColor: '#FCE7F3', color: '#EC4899' }
                    : { color: '#6B7280' }
                }
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={active ? { backgroundColor: '#EC4899', color: '#fff' } : { backgroundColor: '#F3F4F6', color: '#9CA3AF' }}>
                  <Icon size={16} />
                </div>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout — siempre visible abajo */}
        <div className="px-3 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <IconLogout size={16} className="text-gray-400" />
            </div>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── TOP BAR mobile ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 px-4 h-12 flex items-center justify-between">
        <span className="font-serif font-bold" style={{ color: '#EC4899' }}>
          {tiendaNombre}
        </span>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50">
          <IconLogout size={15} />
          Salir
        </button>
      </div>

      {/* ── BOTTOM NAV mobile ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
              style={{ color: active ? '#EC4899' : '#9ca3af' }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[9px] font-semibold">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
