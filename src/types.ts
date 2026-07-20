/**
 * Repote — Tipos de datos principales
 *
 * Define las estructuras de datos utilizadas en toda la aplicación:
 *  - Repair: registro de reparación de un equipo
 *  - PhoneModel: catálogo de modelos con método FRP
 *  - ScreenPart: catálogo de pantallas con precios
 *  - DailyStats: estadísticas calculadas del dashboard
 */

export interface PhoneModel {
  id: string
  brand: string
  model: string
  chipset?: string
  frpMethod?: FrpMethod
  year?: number
}

export type FrpMethod = 'SPD' | 'BROM' | 'Testpoint' | 'UMT' | 'Octoplus' | 'Bypass' | 'EDL' | '';

export type ServiceType = 'FRP' | 'Software' | 'Cambio pantalla' | 'Batería' | 'Pinout' | 'Otro';

export type RepairStatus = 'pendiente' | 'en_proceso' | 'completado' | 'entregado';

export interface ScreenPart {
  id: string
  brand: string
  model: string
  screenType: string       // INCELL | OLED | AMOLED | ORIGINAL CON MARCO | etc.
  wholesalePrice: number   // Precio MAYOR (USD)
  retailPrice: number      // Precio DETAL (USD)
  stockStatus: 'disponible' | 'agotado'
  notes?: string
}

export interface Repair {
  id: string
  dateIn: string           // ISO date (YYYY-MM-DD)
  dateOut?: string
  brand: string
  modelName: string
  modelId?: string
  imei?: string
  serviceType: ServiceType
  frpMethodUsed?: FrpMethod
  hasTestpointFRP: boolean
  isSoftware: boolean
  screenReplaced: boolean
  screenId?: string
  screenPrice?: number
  price: number
  totalPrice: number
  status: RepairStatus
  photo?: string           // base64 JPEG
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DailyStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  delivered: number
  earnings: number
  todayEarnings: number
  weekEarnings: number
  monthEarnings: number
}
