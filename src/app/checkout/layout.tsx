// Checkout depende de carrito/localStorage y query params en runtime — sin valor en prerenderizar estático.
export const dynamic = 'force-dynamic'

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
