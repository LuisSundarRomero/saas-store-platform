interface Props {
  className?: string
}

export function Wordmark({ className = 'text-xl' }: Props) {
  return (
    <span className={`font-comfortaa font-bold tracking-tight ${className}`}>
      <span className="text-pv">pe</span>
      <span className="text-pj">shoop</span>
    </span>
  )
}
