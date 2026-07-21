import { useState, useEffect } from 'react'

type ImageMap = Record<string, string>

let cache: ImageMap | null = null

const BRAND_COLORS: Record<string, string> = {
  Samsung: '#1428A0', Apple: '#555555', Xiaomi: '#FF6900',
  Huawei: '#CF0A2C', Oppo: '#1A6D36', Vivo: '#415FFF',
  Realme: '#FFD800', OnePlus: '#EB0029', Motorola: '#A000FF',
  Google: '#4285F4', Nokia: '#005AFF', LG: '#A50034',
  Sony: '#000000', Asus: '#00A8E8', Lenovo: '#E2231A',
  Honor: '#000000', ZTE: '#0082C8', TCL: '#E31E25',
  Alcatel: '#008542', Tecno: '#000000', Infinix: '#FF6600',
  Blackview: '#242424', BLU: '#00A1DE', Umidigi: '#1565C0',
  POCO: '#FF6900', Krip: '#333333',
}

function hashColor(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffff
  return `hsl(${h % 360}, 45%, 40%)`
}

function initial(brand: string): string {
  return brand.replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase() || '?'
}

function placeholderSvg(brand: string): string {
  const color = BRAND_COLORS[brand] || hashColor(brand)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><rect width="56" height="56" rx="14" fill="${color}"/><text x="28" y="28" dominant-baseline="central" text-anchor="middle" fill="white" font-size="24" font-weight="bold" font-family="system-ui, sans-serif">${initial(brand)}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

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
    if (cache) {
      const partial = Object.entries(cache).find(([k]) =>
        k.startsWith(brand.toLowerCase()) && model.toLowerCase().includes(k.split('|')[1]?.replace(/\s/g, '') || '')
      )
      return partial?.[1]
    }
    return undefined
  }

  const getImageOrPlaceholder = (brand: string, model: string): string => {
    const img = getImage(brand, model)
    return img || placeholderSvg(brand)
  }

  return { images, loading, getImage, getImageOrPlaceholder }
}
