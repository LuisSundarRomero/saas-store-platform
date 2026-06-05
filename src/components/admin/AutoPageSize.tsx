'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function AutoPageSize() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const desired = isMobile ? '8' : '12'
    const current = searchParams.get('size')

    if (current === desired) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('size', desired)
    params.delete('page') // reset to page 1 on size change
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
