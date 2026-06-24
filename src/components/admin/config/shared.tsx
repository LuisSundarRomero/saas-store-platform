'use client'

import { IconCheck, IconEye, IconEyeOff } from '@tabler/icons-react'
import { Switch } from '@/components/ui/Switch'

export const INPUT_CLS =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all bg-white'

export function SaveSection({
  isPending,
  saved,
  error,
  onSave,
}: {
  isPending: boolean
  saved: boolean
  error: string
  onSave: () => void
}) {
  return (
    <div className="lg:col-span-2">
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-3">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={isPending}
        className="w-full sm:w-auto sm:min-w-[200px] font-semibold py-3.5 px-8 rounded-full text-white transition-all disabled:opacity-60 hover:opacity-90 shadow-md"
        style={{
          backgroundColor: saved ? '#10B981' : 'var(--color-brand)',
          boxShadow: saved
            ? '0 4px 15px rgba(16,185,129,0.3)'
            : '0 4px 15px rgba(225,29,46,0.3)',
        }}
      >
        {saved ? '¡Guardado!' : isPending ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
}

export function Field({ label, value, onChange, placeholder, hint }: FieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
        {label}
      </label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLS} placeholder={placeholder} />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export function FieldArea({
  label,
  value,
  onChange,
  placeholder,
}: Omit<FieldProps, 'hint'>) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={`${INPUT_CLS} resize-none`}
        placeholder={placeholder}
      />
    </div>
  )
}

export function VisibilityToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: checked ? '#FEE2E2' : '#F3F4F6' }}
        >
          {checked ? (
            <IconEye size={15} style={{ color: 'var(--color-brand)' }} />
          ) : (
            <IconEyeOff size={15} className="text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  )
}

export function validarNumeroWhatsapp(num: string) {
  return /^\d{10,15}$/.test(num.replace(/\s/g, ''))
}

export function IconCheck16() {
  return <IconCheck size={11} />
}
