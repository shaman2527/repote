/**
 * Hook para cargar imágenes de teléfonos desde phonesdata.com
 * Las imágenes se almacenan como { "marca|modelo": "url" }
 */

import { useState, useEffect } from 'react'

type ImageMap = Record<string, string>

let cache: ImageMap | null = null

export function usePhoneImages() {
  const [images, setImages] = useState<ImageMap>(cache || {})
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return
    import('@/data/phone-images.json')
      .then((mod) => {
        cache = mod.default as ImageMap
        setImages(cache)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getImage = (brand: string, model: string): string | undefined => {
    if (!brand || !model) return undefined
    const key = `${brand.toLowerCase()}|${model.toLowerCase()}`
    if (cache && cache[key]) return cache[key]
    // Try partial match
    if (cache) {
      const partial = Object.entries(cache).find(([k]) =>
        k.startsWith(brand.toLowerCase()) && model.toLowerCase().includes(k.split('|')[1]?.replace(/\s/g, '') || '')
      )
      return partial?.[1]
    }
    return undefined
  }

  return { images, loading, getImage }
}
