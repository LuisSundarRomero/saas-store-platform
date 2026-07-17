'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  IconBuildingStore, IconSettings, IconPhoto,
  IconLayoutBottombar, IconBrandWhatsapp, IconUsers, IconListCheck,
} from '@tabler/icons-react'
import { TiendaTab } from './config/TiendaTab'
import { AnuncioTab } from './config/AnuncioTab'
import { BannerTab } from './config/BannerTab'
import { FooterTab } from './config/FooterTab'
import { MensajesTab } from './config/MensajesTab'
import { NosotrosTab } from './config/NosotrosTab'
import { EstadosTab } from './config/EstadosTab'
import type { ConfigTienda, ConfigAnuncio, ConfigBanner, ConfigFooter, ConfigMensajes, ConfigNosotros, EstadoPedidoConfig } from '@/types'

type TabId = 'tienda' | 'anuncio' | 'banner' | 'nosotros' | 'footer' | 'mensajes' | 'estados'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'tienda',    label: 'Tienda',    icon: IconBuildingStore },
  { id: 'anuncio',   label: 'Anuncio',   icon: IconSettings },
  { id: 'banner',    label: 'Banner',    icon: IconPhoto },
  { id: 'nosotros',  label: 'Nosotros',  icon: IconUsers },
  { id: 'footer',    label: 'Footer',    icon: IconLayoutBottombar },
  { id: 'mensajes',  label: 'Mensajes',  icon: IconBrandWhatsapp },
  { id: 'estados',   label: 'Estados',   icon: IconListCheck },
]

interface Props {
  tienda:    ConfigTienda    | null
  anuncio:   ConfigAnuncio   | null
  banner:    ConfigBanner    | null
  nosotros:  ConfigNosotros  | null
  footer:    ConfigFooter    | null
  mensajes:  ConfigMensajes  | null
  estados:   EstadoPedidoConfig[]
}

const TAB_IDS = TABS.map((t) => t.id)

export function ConfigForm({ tienda, anuncio, banner, nosotros, footer, mensajes, estados }: Props) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as TabId | null
  const [tab, setTab] = useState<TabId>(tabParam && TAB_IDS.includes(tabParam) ? tabParam : 'tienda')

  return (
    <div>
      {/* Tabs nav */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-5 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
            style={
              tab === id
                ? { backgroundColor: '#fff', color: 'var(--color-brand)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: '#9CA3AF' }
            }
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content — cada tab gestiona su propio estado y guardado */}
      {tab === 'tienda'    && <TiendaTab tienda={tienda} />}
      {tab === 'anuncio'   && <AnuncioTab anuncio={anuncio} />}
      {tab === 'banner'    && <BannerTab banner={banner} />}
      {tab === 'nosotros'  && <NosotrosTab nosotros={nosotros} />}
      {tab === 'footer'    && (
        <FooterTab
          footer={footer}
          tiendaNombre={tienda?.tienda_nombre}
          whatsappNumero={tienda?.whatsapp_numero}
        />
      )}
      {tab === 'mensajes'  && <MensajesTab mensajes={mensajes} />}
      {tab === 'estados'   && <EstadosTab estados={estados} />}
    </div>
  )
}
