import { IconCheck } from '@tabler/icons-react'

const PASOS = [
  { numero: 1, label: 'Datos' },
  { numero: 2, label: 'Pago' },
  { numero: 3, label: 'Confirmación' },
] as const

interface Props {
  currentStep: 1 | 2 | 3
}

export function CheckoutStepper({ currentStep }: Props) {
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
      {PASOS.map((paso, i) => {
        const completado = paso.numero < currentStep
        const activo = paso.numero === currentStep

        return (
          <li key={paso.numero} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                style={{
                  backgroundColor: completado || activo ? 'var(--color-brand)' : '#2C2C30',
                  color: completado || activo ? '#FFFFFF' : '#9A9A9E',
                }}
              >
                {completado ? <IconCheck size={14} /> : paso.numero}
              </div>
              <span
                className="text-xs font-semibold hidden sm:inline"
                style={{ color: completado || activo ? '#F5F5F2' : '#6B6B70' }}
              >
                {paso.label}
              </span>
            </div>

            {i < PASOS.length - 1 && (
              <div
                className="w-6 sm:w-10 h-px"
                style={{ backgroundColor: completado ? 'var(--color-brand)' : '#2C2C30' }}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

