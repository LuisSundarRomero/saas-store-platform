'use client'

import { useState, useTransition } from 'react'
import { IconDeviceFloppy, IconEye, IconEyeOff, IconCheck } from '@tabler/icons-react'

interface Props {
  culqiPublicKey: string
  culqiSecretKey: string
  action: (formData: FormData) => Promise<void>
}

export function CulqiKeysForm({ culqiPublicKey, culqiSecretKey, action }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await action(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:border-blue-400 font-mono'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Llave pública (pk_live_...)
          </label>
          <input
            name="culqi_public_key"
            defaultValue={culqiPublicKey}
            placeholder="pk_live_xxxxxxxxxxxxxxxx"
            className={inputCls}
          />
          <p className="text-xs text-gray-400 mt-1">
            Se usa en el navegador del cliente para generar el token de pago.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Llave secreta (sk_live_...)
          </label>
          <div className="relative">
            <input
              name="culqi_secret_key"
              type={showSecret ? 'text' : 'password'}
              defaultValue={culqiSecretKey}
              placeholder="sk_live_xxxxxxxxxxxxxxxx"
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSecret ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Se usa solo en el servidor para crear el cargo. Nunca se expone al cliente.
          </p>
        </div>

      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-brand)' }}
        >
          {saved ? <IconCheck size={16} /> : <IconDeviceFloppy size={16} />}
          {isPending ? 'Guardando...' : saved ? 'Guardado' : 'Guardar llaves'}
        </button>
        {saved && (
          <p className="text-sm text-green-600 font-medium">¡Llaves actualizadas!</p>
        )}
      </div>
    </form>
  )
}
