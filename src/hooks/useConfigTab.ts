import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

/**
 * SRP: encapsula el ciclo de vida de guardado de una pestaña de configuración.
 * OCP: agregar nuevas tabs no requiere tocar este hook — solo llamar a save().
 */
export function useConfigTab() {
  const router = useRouter()
  const [isPending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function save(action: () => Promise<void>) {
    setError('')
    start(async () => {
      try {
        await action()
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar')
      }
    })
  }

  return { isPending, saved, error, setError, save }
}
