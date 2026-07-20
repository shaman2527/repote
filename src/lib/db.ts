import { openDB, type IDBPDatabase } from 'idb'
import type { Repair, PhoneModel, ScreenPart } from '@/types'

const DB_NAME = 'repote-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

export async function getDB() {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('repairs')) {
        const store = db.createObjectStore('repairs', { keyPath: 'id' })
        store.createIndex('status', 'status')
        store.createIndex('dateIn', 'dateIn')
        store.createIndex('brand', 'brand')
      }
      if (!db.objectStoreNames.contains('models')) {
        const store = db.createObjectStore('models', { keyPath: 'id' })
        store.createIndex('brand', 'brand')
      }
      if (!db.objectStoreNames.contains('screens')) {
        const store = db.createObjectStore('screens', { keyPath: 'id' })
        store.createIndex('brand', 'brand')
        store.createIndex('model', 'model')
      }
      if (!db.objectStoreNames.contains('screenCompatibility')) {
        db.createObjectStore('screenCompatibility', { keyPath: 'id' })
      }
    },
  })
  return dbInstance
}

export async function seedModels(models: PhoneModel[]) {
  const db = await getDB()
  const tx = db.transaction('models', 'readwrite')
  const existing = await tx.store.count()
  if (existing === 0) {
    for (const model of models) {
      await tx.store.add(model)
    }
  }
  await tx.done
}

export async function seedScreens(screens: ScreenPart[]) {
  const db = await getDB()
  const tx = db.transaction('screens', 'readwrite')
  const existing = await tx.store.count()
  if (existing === 0) {
    for (const screen of screens) {
      await tx.store.add(screen)
    }
  }
  await tx.done
}

// Repairs CRUD
export async function getAllRepairs(): Promise<Repair[]> {
  const db = await getDB()
  return db.getAll('repairs')
}

export async function getRepair(id: string): Promise<Repair | undefined> {
  const db = await getDB()
  return db.get('repairs', id)
}

export async function addRepair(repair: Repair) {
  const db = await getDB()
  return db.add('repairs', repair)
}

export async function updateRepair(repair: Repair) {
  const db = await getDB()
  return db.put('repairs', repair)
}

export async function deleteRepair(id: string) {
  const db = await getDB()
  return db.delete('repairs', id)
}

export async function getRepairsByStatus(status: string): Promise<Repair[]> {
  const db = await getDB()
  return db.getAllFromIndex('repairs', 'status', status)
}

// Models
export async function getAllModels(): Promise<PhoneModel[]> {
  const db = await getDB()
  return db.getAll('models')
}

export async function getModelsByBrand(brand: string): Promise<PhoneModel[]> {
  const db = await getDB()
  return db.getAllFromIndex('models', 'brand', brand)
}

// Screens
export async function getAllScreens(): Promise<ScreenPart[]> {
  const db = await getDB()
  return db.getAll('screens')
}

export async function getScreensByBrand(brand: string): Promise<ScreenPart[]> {
  const db = await getDB()
  return db.getAllFromIndex('screens', 'brand', brand)
}

export async function getScreensByModel(model: string): Promise<ScreenPart[]> {
  const db = await getDB()
  return db.getAllFromIndex('screens', 'model', model)
}
