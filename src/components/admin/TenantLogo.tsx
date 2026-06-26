'use client'

import { useState } from 'react'

interface Props {
  src: string
  alt: string
}

export function TenantLogo({ src, alt }: Props) {
  const [broken, setBroken] = useState(false)

  if (broken) {
    return <span className="text-3xl drop-shadow-sm select-none">🦇</span>
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={64}
      height={64}
      className="w-full h-full object-cover"
      onError={() => setBroken(true)}
    />
  )
}
