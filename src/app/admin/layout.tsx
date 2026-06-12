export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div style={{ colorScheme: 'light', display: 'contents' }}>{children}</div>
}
