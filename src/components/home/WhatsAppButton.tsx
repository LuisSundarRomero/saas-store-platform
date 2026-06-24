'use client'

import { IconBrandWhatsapp } from '@tabler/icons-react'

export function WhatsAppButton({ numero }: { numero: string }) {
  return (
    <a
      href={`https://wa.me/${numero.replace(/\s/g, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn inline-flex items-center gap-2 font-medium px-6 py-3 rounded-full text-sm border transition-colors"
    >
      <IconBrandWhatsapp size={16} /> Escríbenos
    </a>
  )
}
