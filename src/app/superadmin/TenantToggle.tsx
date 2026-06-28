'use client'

import { useState, useTransition } from 'react'
import { toggleTenantActivo } from '@/lib/actions/superadmin'

export function TenantToggle({ id, activo }: { id: string; activo: boolean }) {
  const [value, setValue] = useState(activo)
  const [isPending, start] = useTransition()

  function toggle() {
    const next = !value
    setValue(next)
    start(() => toggleTenantActivo(id, next))
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      style={{
        width: 36,
        height: 20,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: value ? '#10b981' : '#3a3a3e',
        position: 'relative',
        transition: 'background-color 0.2s',
        opacity: isPending ? 0.6 : 1,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 2,
        left: value ? 18 : 2,
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: '#fff',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}
