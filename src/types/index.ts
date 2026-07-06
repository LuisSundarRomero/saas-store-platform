// Slugs de sistema con lógica especial en el código — el resto son libres por tenant
export type EstadoPedidoSistema = 'pendiente' | 'pago_confirmado' | 'entregado'
export type EstadoPedido = string

export interface EstadoPedidoConfig {
  id: string
  tenant_id: string
  slug: string
  label: string
  emoji: string
  color_bg: string
  color_text: string
  orden: number
  es_sistema: boolean
  requiere_comprobante: boolean
  notificar_whatsapp: boolean
  mensaje_whatsapp: string
  visible: boolean
}

export interface Categoria {
  id: string
  nombre: string
  slug: string
  imagen_url: string | null
  orden: number
  activa: boolean
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  precio: number // en centavos
  categoria_id: string | null
  imagenes: string[]
  tallas: string[]
  colores: string[]
  precio_antes: number | null
  stock: number | null
  stock_tallas: Record<string, number> | null
  stock_colores: Record<string, number> | null
  es_nuevo: boolean
  destacado: boolean
  visible: boolean
  created_at: string
  updated_at: string
  categorias?: Categoria
}

export type MetodoPago = 'whatsapp' | 'culqi'

export interface Pedido {
  id: string
  order_id: string // 'ORD-001'
  cliente_nombre: string | null
  cliente_telefono: string
  cliente_email: string | null
  cliente_direccion: string | null
  total: number // en centavos
  estado: EstadoPedido
  metodo_pago: MetodoPago
  culqi_charge_id: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export interface PedidoItem {
  id: string
  pedido_id: string
  producto_id: string | null
  nombre: string
  precio: number // centavos, snapshot
  talla: string | null
  color: string | null
  cantidad: number
  subtotal: number // centavos
}

export interface EstadoHistorial {
  id: string
  pedido_id: string
  estado: EstadoPedido
  changed_at: string
}

export interface PedidoConItems extends Pedido {
  pedido_items: PedidoItem[]
  estado_historial?: EstadoHistorial[]
}

export interface Config {
  id: string
  tienda_nombre: string
  logo_url: string | null
  whatsapp_numero: string
  moneda: string
  whatsapp_template: string
}

// ─── Config types (multi-tab) ────────────────────────────────

export interface ConfigTienda {
  tenant_id?: string
  tienda_nombre: string
  whatsapp_numero: string
  moneda: string
  email_notif: string | null
  empresa_razon: string | null
  empresa_ruc: string | null
  empresa_dir: string | null
}

export interface ConfigAnuncio {
  tenant_id?: string
  visible: boolean
  texto: string
  link: string | null
  expira: string | null
}

export interface ConfigBanner {
  tenant_id?: string
  hero_badge: string
  hero_titulo: string
  hero_subtitulo: string
  hero_boton: string
  hero_visible: boolean
  imagenes_visible: boolean
  imagenes: string[]
  imagenes_links: string[]
  strip_visible: boolean
  strip_item1: string
  strip_item2: string
  strip_item3: string
  strip_item4: string
  categorias_sidebar: boolean
}

export interface ConfigFooter {
  tenant_id?: string
  descripcion: string
  politica: string
  info1: string
  info2: string
  info3: string
  info4: string
  email: string | null
  tagline: string
  instagram: string | null
  tiktok: string | null
}

export interface ConfigMensajes {
  tenant_id?: string
  whatsapp_template: string
}

export interface ConfigNosotros {
  tenant_id?: string
  visible: boolean
  titulo: string
  subtitulo: string
  descripcion: string
  imagen_url: string | null
}

export type TipoDocumento = 'DNI' | 'CE' | 'Pasaporte'
export type TipoBien = 'producto' | 'servicio'
export type TipoReclamacion = 'reclamo' | 'queja'
export type EstadoReclamacion = 'pendiente' | 'atendido'

export interface Reclamacion {
  id: string
  numero: number
  consumidor_nombre: string
  consumidor_domicilio: string
  consumidor_tipo_doc: TipoDocumento
  consumidor_num_doc: string
  consumidor_email: string
  consumidor_telefono: string | null
  tutor_nombre: string | null
  bien_tipo: TipoBien
  bien_descripcion: string
  monto_reclamado: number | null // en centavos
  tipo: TipoReclamacion
  detalle: string
  pedido: string
  estado: EstadoReclamacion
  respuesta: string | null
  created_at: string
  respondido_at: string | null
}

export interface CartItem {
  productoId: string
  nombre: string
  imagen: string
  precio: number // centavos
  precioAntes?: number // centavos, precio original si tiene descuento
  talla: string
  color: string
  cantidad: number
}
