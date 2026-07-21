/**
 * Sistema profesional de compatibilidad entre modelos de teléfonos y pantallas.
 *
 * El catálogo CELL WORLD (screen_catalog.json) contiene pantallas con nombres
 * comerciales como "A01 A015" o "GALAXY A01 A015 INCELL".
 * El sistema de matching usa múltiples estrategias para encontrar coincidencias.
 */

import type { ScreenPart } from '@/types'
import screenData from '@/data/screen_catalog.json'

const SCREENS: ScreenPart[] = screenData as ScreenPart[]

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/galaxy\s*/g, '')
    .replace(/\bredmi\s*/g, '')
    .replace(/\bmoto\s*/g, '')
    .replace(/\bmi\s+/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\d{4}/g, '')
    .replace(/[^a-z0-9\s/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractModelKey(model: string): string {
  const m = model.toLowerCase().replace(/[^a-z0-9]/g, ' ')
  // Extract the primary identifier: letter+digits (e.g., "a01", "a125", "note10")
  const primary = m.match(/([a-z]+\s*\d+[a-z]?\d*)/)
  return primary ? primary[1].replace(/\s+/g, '') : ''
}

function extractScreenModels(screenModel: string): string[] {
  const parts = screenModel.split('/').map(p => p.trim()).filter(Boolean)
  if (parts.length > 1) return parts
  return [screenModel]
}

export function getCompatibleScreens(brand: string, modelName: string): ScreenPart[] {
  if (!brand || !modelName) return []

  const normalized = normalize(modelName)
  const phoneKey = extractModelKey(modelName)
  const phoneWords = normalized.split(/\s+/).filter(w => w.length > 1)

  const brandScreens = SCREENS.filter(s => s.brand.toLowerCase() === brand.toLowerCase())
  const matches: { screen: ScreenPart; score: number }[] = []

  for (const screen of brandScreens) {
    const screenModels = extractScreenModels(screen.model)
    let bestScore = 0

    for (const sm of screenModels) {
      const screenNorm = normalize(sm)
      const screenKey = extractModelKey(sm)
      let score = 0

      if (screenNorm === normalized) {
        score = 100
      } else if (phoneKey && screenKey && phoneKey === screenKey) {
        score = 80
      } else if (phoneKey && screenKey) {
        if (screenKey.includes(phoneKey) || phoneKey.includes(screenKey)) {
          score = 60
        }
      }

      if (score === 0) {
        for (const word of phoneWords) {
          if (word.length > 2 && screenNorm.includes(word)) {
            score += 20
          }
        }
        const phoneNum = normalized.match(/([a-z]\d+)/)
        if (phoneNum) {
          const screenNum = screenNorm.match(/([a-z]\d+)/)
          if (screenNum && screenNum[1] === phoneNum[1]) {
            score += 30
          }
        }
      }

      if (score > bestScore) bestScore = score
    }

    if (bestScore > 0) {
      matches.push({ screen, score: bestScore })
    }
  }

  matches.sort((a, b) => b.score - a.score)
  return matches.slice(0, 8).map(m => m.screen)
}

/**
 * Detecta la serie de un modelo para mostrar badges de colores.
 */
export interface SeriesInfo {
  name: string
  color: string
  bgClass: string
  textClass: string
}

export function detectSeries(brand: string, model: string): SeriesInfo | null {
  const m = model.toLowerCase()
  const b = brand.toLowerCase()

  // Samsung
  if (b === 'samsung') {
    if (/galaxy\s+z\s?(fold|flip)/.test(m)) return { name: 'Z Series', color: '#ec4899', bgClass: 'bg-pink-500/10', textClass: 'text-pink-400' }
    if (/galaxy\s+s\d/.test(m)) return { name: 'S Series', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/galaxy\s+a\d/.test(m)) return { name: 'A Series', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/galaxy\s+j\d/.test(m)) return { name: 'J Series', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    if (/galaxy\s+m\d/.test(m)) return { name: 'M Series', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/galaxy\s+f\d/.test(m)) return { name: 'F Series', color: '#06b6d4', bgClass: 'bg-cyan-500/10', textClass: 'text-cyan-400' }
    if (/galaxy\s+note/.test(m)) return { name: 'Note', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/galaxy\s+((xcover|wide|quantum))/.test(m)) return { name: 'Special', color: '#6366f1', bgClass: 'bg-indigo-500/10', textClass: 'text-indigo-400' }
    return { name: 'Galaxy', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // Xiaomi / Redmi / POCO
  if (b === 'xiaomi' || b === 'poco') {
    if (/redmi\s+note/.test(m)) return { name: 'Redmi Note', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    if (/redmi\s+[a-z]\d/.test(m)) return { name: 'Redmi', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    if (/redmi\s+[a-z]/.test(m)) return { name: 'Redmi A', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    if (/redmi\s+/.test(m)) return { name: 'Redmi', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    if (/poco\s+[xf]/.test(m)) return { name: 'POCO F/X', color: '#eab308', bgClass: 'bg-yellow-500/10', textClass: 'text-yellow-400' }
    if (/poco\s+m\d/.test(m)) return { name: 'POCO M', color: '#eab308', bgClass: 'bg-yellow-500/10', textClass: 'text-yellow-400' }
    if (/poco\s+c\d/.test(m)) return { name: 'POCO C', color: '#eab308', bgClass: 'bg-yellow-500/10', textClass: 'text-yellow-400' }
    if (/poco/.test(m)) return { name: 'POCO', color: '#eab308', bgClass: 'bg-yellow-500/10', textClass: 'text-yellow-400' }
    if (/xiaomi\s+\d+/.test(m)) return { name: 'Xiaomi', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    if (/mi\s+\d+/.test(m)) return { name: 'Mi', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    if (/(mix|black.shark|civi)/.test(m)) return { name: 'Special', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    return { name: 'Xiaomi', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
  }

  // Huawei
  if (b === 'huawei') {
    if (/pura/.test(m)) return { name: 'Pura', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/p\d+/.test(m)) return { name: 'P Series', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/mate/.test(m) && !/honor/.test(m)) return { name: 'Mate', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/nova/.test(m)) return { name: 'Nova', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    if (/honor/.test(m)) return { name: 'Honor', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/y\d/.test(m)) return { name: 'Y Series', color: '#06b6d4', bgClass: 'bg-cyan-500/10', textClass: 'text-cyan-400' }
    if (/enjoy|maimang/.test(m)) return { name: 'Enjoy', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/pocket/.test(m)) return { name: 'Pocket', color: '#ec4899', bgClass: 'bg-pink-500/10', textClass: 'text-pink-400' }
    return { name: 'Huawei', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // Oppo
  if (b === 'oppo') {
    if (/find\s+x/.test(m)) return { name: 'Find X', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/find\s+n/.test(m)) return { name: 'Find N', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/reno/.test(m)) return { name: 'Reno', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/a\d+/.test(m)) return { name: 'A Series', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/f\d+/.test(m)) return { name: 'F Series', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/k\d+/.test(m)) return { name: 'K Series', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    return { name: 'Oppo', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // Vivo
  if (b === 'vivo') {
    if (/iqoo/.test(m)) return { name: 'iQOO', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/x\d+/.test(m)) return { name: 'X Series', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/v\d+/.test(m)) return { name: 'V Series', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    if (/y\d+/.test(m)) return { name: 'Y Series', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/t\d+/.test(m)) return { name: 'T Series', color: '#06b6d4', bgClass: 'bg-cyan-500/10', textClass: 'text-cyan-400' }
    if (/s\d+/.test(m)) return { name: 'S Series', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/nex/.test(m)) return { name: 'NEX', color: '#ec4899', bgClass: 'bg-pink-500/10', textClass: 'text-pink-400' }
    return { name: 'Vivo', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // Realme
  if (b === 'realme') {
    if (/gt\s+neo/.test(m)) return { name: 'GT Neo', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/gt/.test(m)) return { name: 'GT', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/narzo/.test(m)) return { name: 'Narzo', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    if (/c\d+/.test(m)) return { name: 'C Series', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/note/.test(m)) return { name: 'Note', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/p\d+/.test(m)) return { name: 'P Series', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/neo/.test(m)) return { name: 'Neo', color: '#06b6d4', bgClass: 'bg-cyan-500/10', textClass: 'text-cyan-400' }
    if (/x\d+/.test(m)) return { name: 'X Series', color: '#ec4899', bgClass: 'bg-pink-500/10', textClass: 'text-pink-400' }
    if (/v\d+/.test(m)) return { name: 'V Series', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    if (/q\d+/.test(m)) return { name: 'Q Series', color: '#6366f1', bgClass: 'bg-indigo-500/10', textClass: 'text-indigo-400' }
    return { name: 'Realme', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // OnePlus
  if (b === 'oneplus') {
    if (/ace/.test(m)) return { name: 'Ace', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/nord/.test(m)) return { name: 'Nord', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/open/.test(m)) return { name: 'Open', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/\d+(t|pro|r)?/.test(m)) return { name: 'Flagship', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    return { name: 'OnePlus', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // Tecno
  if (b === 'tecno') {
    if (/phantom/.test(m)) return { name: 'Phantom', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/camon/.test(m)) return { name: 'Camon', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/spark/.test(m)) return { name: 'Spark', color: '#06b6d4', bgClass: 'bg-cyan-500/10', textClass: 'text-cyan-400' }
    if (/pova/.test(m)) return { name: 'Pova', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/pop/.test(m)) return { name: 'Pop', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    if (/pouvoir/.test(m)) return { name: 'Pouvoir', color: '#6366f1', bgClass: 'bg-indigo-500/10', textClass: 'text-indigo-400' }
    return { name: 'Tecno', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // Infinix
  if (b === 'infinix') {
    if (/hot/.test(m)) return { name: 'Hot', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/note/.test(m)) return { name: 'Note', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/zero/.test(m)) return { name: 'Zero', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    if (/smart/.test(m)) return { name: 'Smart', color: '#06b6d4', bgClass: 'bg-cyan-500/10', textClass: 'text-cyan-400' }
    if (/gt\s+\d+/.test(m)) return { name: 'GT', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/s\d+/.test(m)) return { name: 'S Series', color: '#ec4899', bgClass: 'bg-pink-500/10', textClass: 'text-pink-400' }
    return { name: 'Infinix', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // Motorola
  if (b === 'motorola') {
    if (/moto\s+g/.test(m)) return { name: 'Moto G', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/moto\s+e/.test(m)) return { name: 'Moto E', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/edge/.test(m)) return { name: 'Edge', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/razr/.test(m)) return { name: 'Razr', color: '#ec4899', bgClass: 'bg-pink-500/10', textClass: 'text-pink-400' }
    if (/one\s/.test(m)) return { name: 'One', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    if (/defy/.test(m)) return { name: 'Defy', color: '#6366f1', bgClass: 'bg-indigo-500/10', textClass: 'text-indigo-400' }
    return { name: 'Motorola', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // LG
  if (b === 'lg') {
    if (/stylo/.test(m)) return { name: 'Stylo', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/k\d+/.test(m)) return { name: 'K Series', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    if (/q\d+/.test(m)) return { name: 'Q Series', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/v\d+/.test(m)) return { name: 'V Series', color: '#06b6d4', bgClass: 'bg-cyan-500/10', textClass: 'text-cyan-400' }
    if (/g\d+/.test(m)) return { name: 'G Series', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/w\d+/.test(m)) return { name: 'W Series', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/velvet/.test(m)) return { name: 'Velvet', color: '#ec4899', bgClass: 'bg-pink-500/10', textClass: 'text-pink-400' }
    if (/wing/.test(m)) return { name: 'Wing', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    return { name: 'LG', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // Google
  if (b === 'google') {
    return { name: 'Pixel', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
  }

  // Apple
  if (b === 'apple') {
    if (/pro\s*max/.test(m)) return { name: 'Pro Max', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/pro/.test(m)) return { name: 'Pro', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/se/.test(m)) return { name: 'SE', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    return { name: 'iPhone', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // Nokia
  if (b === 'nokia') {
    if (/g\d+/.test(m)) return { name: 'G Series', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/c\d+/.test(m)) return { name: 'C Series', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/x\d+/.test(m)) return { name: 'X Series', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    return { name: 'Nokia', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // ZTE / Nubia
  if (b === 'zte') {
    if (/nubia|redmagic/.test(m)) return { name: 'Nubia', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/axon/.test(m)) return { name: 'Axon', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/blade/.test(m)) return { name: 'Blade', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    if (/voyage/.test(m)) return { name: 'Voyage', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    return { name: 'ZTE', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  // Alcatel
  if (b === 'alcatel') {
    if (/go\s+flip/.test(m)) return { name: 'Go Flip', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/\d+[ls]?/.test(m)) return { name: '1 Series', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    return { name: 'Alcatel', color: '#6b7280', bgClass: 'bg-gray-500/10', textClass: 'text-gray-400' }
  }

  return null
}

/**
 * Obtiene todas las pantallas disponibles para una marca.
 */
export function getScreensByBrand(brand: string): ScreenPart[] {
  return SCREENS.filter(s => s.brand.toLowerCase() === brand.toLowerCase())
}
