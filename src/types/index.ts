export type EstadoPedido = 'pendiente' | 'pago_confirmado' | 'empaquetado' | 'en_camino' | 'entregado'

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
