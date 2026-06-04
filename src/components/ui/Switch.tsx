'use client'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  size?: 'sm' | 'md'
}

export function Switch({ checked, onChange, disabled, label, size = 'md' }: SwitchProps) {
  const isSm = size === 'sm'
  const trackW  = isSm ? 40 : 52
  const trackH  = isSm ? 22 : 30
  const dotSize = isSm ? 16 : 22
  const pad     = 4

  return (
    <label
      className={`inline-flex items-center gap-2.5 select-none ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      style={{ touchAction: 'manipulation' }}
    >
      <div
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className="relative rounded-full shrink-0 flex items-center"
        style={{
          width: trackW,
          height: trackH,
          backgroundColor: checked ? '#EC4899' : '#D1D5DB',
          transition: 'background-color 0.2s ease',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: pad,
        }}
      >
        <div
          className="bg-white rounded-full"
          style={{
            width:  dotSize,
            height: dotSize,
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            transform: checked ? `translateX(${trackW - dotSize - pad * 2}px)` : 'translateX(0)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </div>

      {label && (
        <span className={`text-gray-700 font-medium ${isSm ? 'text-xs' : 'text-sm'}`}>
          {label}
        </span>
      )}
    </label>
  )
}
