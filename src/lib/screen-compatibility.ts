/**
 * Sistema de compatibilidad entre modelos de teléfonos y pantallas de repuesto.
 *
 * El catálogo de pantallas (screen_catalog.json) contiene entradas como:
 *   { brand: "Samsung", model: "A01 A015", screenType: "INCELL", ... }
 *
 * El catálogo de modelos (seed-models.ts) contiene entradas como:
 *   { brand: "Samsung", model: "Galaxy A01", ... }
 *
 * La lógica de matching busca coincidencias entre el modelo del teléfono
 * y el nombre comercial/modelo de la pantalla.
 */

import type { ScreenPart } from '@/types'
import screenData from '@/data/screen_catalog.json'

const SCREENS: ScreenPart[] = screenData as ScreenPart[]

/**
 * Normaliza un nombre de modelo para facilitar el matching:
 * - Quita "Galaxy", "Redmi", "Moto", "Mi " etc.
 * - Quita paréntesis y años
 * - Convierte a minúsculas
 */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/galaxy\s*/g, '')
    .replace(/redmi\s*/g, 'redmi ')
    .replace(/moto\s*/g, '')
    .replace(/mi\s+/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\d{4}/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Obtiene las pantallas compatibles para un modelo específico.
 * Busca coincidencias por marca y similitud de nombre de modelo.
 */
export function getCompatibleScreens(brand: string, modelName: string): ScreenPart[] {
  if (!brand || !modelName) return []

  const normalized = normalize(modelName)
  const words = normalized.split(/\s+/).filter(w => w.length > 2)

  // Filtrar por marca
  const brandScreens = SCREENS.filter(s => s.brand.toLowerCase() === brand.toLowerCase())

  // Buscar coincidencias de modelo
  const matches: { screen: ScreenPart; score: number }[] = []

  for (const screen of brandScreens) {
    const screenNorm = normalize(screen.model)
    let score = 0

    // Coincidencia exacta
    if (screenNorm === normalized) {
      score = 100
    } else {
      // Contar cuántas palabras clave coinciden
      for (const word of words) {
        if (screenNorm.includes(word)) {
          score += 20
        }
      }
      // Coincidencia del primer número de modelo (ej: "A12" en "A12 A125")
      const modelNum = normalized.match(/([a-z]\d+)/)
      if (modelNum) {
        const screenModelNum = screenNorm.match(/([a-z]\d+)/)
        if (screenModelNum && screenModelNum[1] === modelNum[1]) {
          score += 30
        }
      }
    }

    if (score > 0) {
      matches.push({ screen, score })
    }
  }

  // Ordenar por score descendente
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

  // Samsung series
  if (b === 'samsung') {
    if (/galaxy\s+a\d/.test(m)) return { name: 'A Series', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/galaxy\s+s\d/.test(m)) return { name: 'S Series', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/galaxy\s+note/.test(m)) return { name: 'Note', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/galaxy\s+j\d/.test(m)) return { name: 'J Series', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    if (/galaxy\s+m\d/.test(m)) return { name: 'M Series', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/galaxy\s+f\d/.test(m)) return { name: 'F Series', color: '#06b6d4', bgClass: 'bg-cyan-500/10', textClass: 'text-cyan-400' }
    if (/galaxy\s+z\s?(fold|flip)/.test(m)) return { name: 'Z Series', color: '#ec4899', bgClass: 'bg-pink-500/10', textClass: 'text-pink-400' }
    if (/galaxy\s+fold/.test(m)) return { name: 'Fold', color: '#ec4899', bgClass: 'bg-pink-500/10', textClass: 'text-pink-400' }
  }

  // Xiaomi/Redmi/POCO series
  if (b === 'xiaomi' || b === 'poco') {
    if (/redmi\s+note/.test(m)) return { name: 'Redmi Note', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    if (/redmi\s+[a-z]/.test(m)) return { name: 'Redmi', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    if (/poco\s+[xf]/.test(m)) return { name: 'POCO F/X', color: '#eab308', bgClass: 'bg-yellow-500/10', textClass: 'text-yellow-400' }
    if (/poco\s+m\d/.test(m)) return { name: 'POCO M', color: '#eab308', bgClass: 'bg-yellow-500/10', textClass: 'text-yellow-400' }
    if (/poco\s+c\d/.test(m)) return { name: 'POCO C', color: '#eab308', bgClass: 'bg-yellow-500/10', textClass: 'text-yellow-400' }
    if (/xiaomi\s+\d+/.test(m)) return { name: 'Xiaomi', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    if (/mi\s+\d+/.test(m)) return { name: 'Mi', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
    if (/mi\s+(mix|note|a\d)/.test(m)) return { name: 'Mi Series', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
  }

  // Tecno series
  if (b === 'tecno') {
    if (/spark/.test(m)) return { name: 'Spark', color: '#06b6d4', bgClass: 'bg-cyan-500/10', textClass: 'text-cyan-400' }
    if (/camon/.test(m)) return { name: 'Camon', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/pova/.test(m)) return { name: 'Pova', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/pop/.test(m)) return { name: 'Pop', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
  }

  // Infinix series
  if (b === 'infinix') {
    if (/hot/.test(m)) return { name: 'Hot', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/note/.test(m)) return { name: 'Note', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/smart/.test(m)) return { name: 'Smart', color: '#06b6d4', bgClass: 'bg-cyan-500/10', textClass: 'text-cyan-400' }
    if (/zero/.test(m)) return { name: 'Zero', color: '#f97316', bgClass: 'bg-orange-500/10', textClass: 'text-orange-400' }
  }

  // Motorola
  if (b === 'motorola') {
    if (/moto\s+g/.test(m)) return { name: 'Moto G', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/moto\s+e/.test(m)) return { name: 'Moto E', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
    if (/edge/.test(m)) return { name: 'Edge', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
  }

  // Huawei
  if (b === 'huawei') {
    if (/p\d+/.test(m)) return { name: 'P Series', color: '#ef4444', bgClass: 'bg-red-500/10', textClass: 'text-red-400' }
    if (/mate/.test(m)) return { name: 'Mate', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/nova/.test(m)) return { name: 'Nova', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    if (/honor/.test(m)) return { name: 'Honor', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
    if (/y\d/.test(m)) return { name: 'Y Series', color: '#06b6d4', bgClass: 'bg-cyan-500/10', textClass: 'text-cyan-400' }
    if (/p\s+smart/.test(m)) return { name: 'P Smart', color: '#10b981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-400' }
  }

  // LG
  if (b === 'lg') {
    if (/k\d/.test(m)) return { name: 'K Series', color: '#f59e0b', bgClass: 'bg-amber-500/10', textClass: 'text-amber-400' }
    if (/q\d/.test(m)) return { name: 'Q Series', color: '#3b82f6', bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' }
    if (/stylo/.test(m)) return { name: 'Stylo', color: '#8b5cf6', bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' }
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

  return null
}

/**
 * Obtiene todas las pantallas disponibles para una marca.
 */
export function getScreensByBrand(brand: string): ScreenPart[] {
  return SCREENS.filter(s => s.brand.toLowerCase() === brand.toLowerCase())
}
