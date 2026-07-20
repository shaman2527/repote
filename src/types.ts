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
  screenType: string
  wholesalePrice: number
  retailPrice: number
  stockStatus: 'disponible' | 'agotado'
  notes?: string
}

export interface ScreenCompatibility {
  id: string
  originalModelId: string
  compatibleScreenId: string
  notes?: string
}

export interface Repair {
  id: string
  dateIn: string
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
  photo?: string
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
