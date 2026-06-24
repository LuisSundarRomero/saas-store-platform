import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * DIP: abstrae la dependencia directa de Supabase Storage.
 * Los componentes reciben URLs — no saben nada de buckets ni rutas.
 */
export function useImageUpload(bucket = 'productos', pathPrefix = '') {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  async function upload(files: FileList, currentCount: number, maxImages: number): Promise<string[]> {
    setError('')
    setUploading(true)
    const supabase = createClient()
    const urls: string[] = []
    const available = maxImages - currentCount
    const toUpload = Array.from(files).slice(0, available)

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i]
      setProgress(`Subiendo ${i + 1} de ${toUpload.length}...`)
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" supera los 5MB`)
        continue
      }
      const ext = file.name.split('.').pop()
      const path = `${pathPrefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false })
      if (uploadError) {
        setError(`Error subiendo "${file.name}"`)
      } else {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }

    setUploading(false)
    setProgress('')
    return urls
  }

  return { uploading, progress, error, upload }
}
