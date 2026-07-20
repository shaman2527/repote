# Repote

**Control de reparaciones de teléfonos móviles** — PWA mobile-first para talleres de reparación.

Gestiona entradas/salidas, FRP, flasheo, cambio de pantallas y ganancias. App instalable en Android/iOS/Desktop con soporte offline.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript 6 + Vite 8 |
| UI | shadcn/ui + Radix UI + Tailwind CSS v4 |
| 3D | Three.js (fondo interactivo en Dashboard) |
| Charts | Recharts (ganancias, servicios, estados) |
| Iconos | Lucide React |
| PWA | vite-plugin-pwa (Workbox) |
| Persistencia | IndexedDB via idb |
| Export | SheetJS (Excel/CSV) |
| Backend (IA) | FastAPI + DeepSeek API (opcional) |
| CI/CD | GitHub Actions + Vercel |

---

## Inicio Rápido

```bash
# Frontend
npm install
npm run dev              # http://localhost:5173

# Backend IA (opcional)
cd backend
pip install -r requirements.txt
cp .env.example .env     # Configurar DEEPSEEK_API_KEY
python main.py           # http://localhost:8000
```

## Build producción

```bash
npm run build
npm run preview          # Vista previa del build
```

## Despliegue

```bash
git push origin main     # CI/CD → Vercel deploy automático
```

**URL producción:** https://repote.vercel.app

---

## Funcionalidades

### 📱 Control de Equipos
- **Registro** con selección de marca → modelo (500+ modelos precargados)
- **Cámara** integrada para fotos del equipo
- **Estado**: pendiente → en proceso → completado → entregado
- **Eliminar** individual o reset total de datos

### 🔓 FRP y Desbloqueo
- Métodos FRP por chipset: **SPD** (Unisoc), **BROM** (MediaTek), **Testpoint** (Qualcomm), **EDL**, **Bypass**
- 500+ modelos con método FRP preasignado
- AI Assistant integrado (FastAPI + DeepSeek)

### 📊 Dashboard y Reportes
- **Dashboard** con fondo 3D interactivo (Three.js)
- **Charts**: ganancias (7 días), distribución de servicios
- **Stats**: pendientes, en proceso, completados, entregados
- **Ganancias**: hoy, semana, mes, total
- **Exportar** a Excel (.xlsx) y CSV

### 🖥️ Catálogo de Pantallas
- 658 pantallas de repuesto con precios MAYOR/DETAL
- 16 marcas: Samsung, Xiaomi, Huawei, Tecno, Infinix, Motorola, LG, etc.
- Filtro por marca y búsqueda
- Estado de stock (disponible/agotado)

### 🤖 AI Assistant (opcional)
- Backend FastAPI con DeepSeek API
- Responde sobre FRP, flasheo, pantallas y reparación
- Entrada por voz (Web Speech API)
- Fallback rule-based sin API key

### 📱 PWA
- Instalable en Android/iOS/Desktop
- Offline-first con Service Worker
- Orientación portrait optimizada
- Icono profesional técnico/reparación

---

## Estructura del Proyecto

```
repote/
├── .github/workflows/    # CI/CD pipeline
├── backend/              # FastAPI + DeepSeek
│   ├── main.py           # API endpoints
│   └── requirements.txt
├── data/                 # Datos extraídos del PDF
│   └── screen_catalog.json
├── public/icons/         # PWA icons (SVG + PNG)
├── scripts/              # Herramientas de extracción
│   ├── extract-pdf.py
│   ├── parse-screens.py
│   ├── cleanup-data.py
│   └── generate-icons.mjs
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui (Button, Card, Select, Dialog...)
│   │   ├── AIAssistant.tsx
│   │   ├── CameraCapture.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ModelSelect.tsx
│   │   ├── NavBar.tsx
│   │   ├── StatsCard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ThreeBackground.tsx
│   ├── data/
│   │   └── screen_catalog.json   # 658 pantallas
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useRepairs.ts
│   ├── lib/
│   │   ├── db.ts              # IndexedDB
│   │   ├── seed-models.ts     # 500+ modelos con FRP
│   │   └── utils.ts           # cn() utility
│   └── pages/
│       ├── Dashboard.tsx      # Stats + charts + 3D
│       ├── AddRepair.tsx      # Registro de equipo
│       ├── ListRepairs.tsx    # Lista con filtros
│       ├── DetailRepair.tsx   # Detalle y edición
│       ├── Report.tsx         # Exportación y análisis
│       ├── ScreenCatalog.tsx  # Catálogo de pantallas
│       └── ModelCatalog.tsx   # Catálogo de modelos
├── index.html
├── vite.config.ts
├── vercel.json
├── HARNESS.md               # Orquestación del proyecto
└── README.md
```

---

## Modelo de Datos

### `PhoneRepair`

```ts
interface Repair {
  id: string              // UUID
  dateIn: string          // Fecha de entrada (ISO)
  dateOut?: string        // Fecha de entrega (ISO)
  brand: string           // Marca
  modelName: string       // Modelo
  modelId?: string        // ID del modelo en catálogo
  imei?: string           // IMEI
  serviceType: ServiceType // FRP | Software | Cambio pantalla | Batería | Pinout | Otro
  frpMethodUsed?: FrpMethod // SPD | BROM | Testpoint | UMT | Octoplus | Bypass | EDL
  hasTestpointFRP: boolean
  isSoftware: boolean
  screenReplaced: boolean
  screenId?: string
  screenPrice?: number
  price: number           // Precio del servicio
  totalPrice: number      // Precio total
  status: RepairStatus    // pendiente | en_proceso | completado | entregado
  photo?: string          // Foto en base64
  notes?: string
  createdAt: string
  updatedAt: string
}
```

### `PhoneModel`

```ts
interface PhoneModel {
  id: string
  brand: string
  model: string
  chipset?: string
  frpMethod?: FrpMethod
  year?: number
}
```

### `ScreenPart`

```ts
interface ScreenPart {
  id: string
  brand: string
  model: string
  screenType: string     // INCELL | OLED | AMOLED | ORIGINAL | etc.
  wholesalePrice: number
  retailPrice: number
  stockStatus: 'disponible' | 'agotado'
}
```

---

## API Backend (FastAPI)

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/chat` | POST | Chat con AI Assistant |
| `/api/health` | GET | Health check + stats |

### POST `/api/chat`

```json
{
  "message": "cómo hacer FRP Samsung A12",
  "history": []
}
```

Response:

```json
{
  "response": "Para Samsung A12 (Exynos 850)..."
}
```

### Variables de entorno

| Variable | Descripción |
|---|---|
| `DEEPSEEK_API_KEY` | API key de DeepSeek (opcional, sin ella usa fallback) |

---

## Comandos del Harness

```bash
npm run dev              # Desarrollo frontend
npm run build            # Build producción
npm run preview          # Preview build
npm run lint             # Linting
npm run setup            # Instalación completa + íconos
npm run icons:generate   # Regenerar íconos PWA

# Backend
cd backend
pip install -r requirements.txt
python main.py           # Inicia API en :8000
```

---

## Roadmap

| Fase | Estado | Descripción |
|---|---|---|
| 1. Core App | ✅ | Scaffold, routing, PWA, DB |
| 2. Modelos FRP | ✅ | 500+ modelos con métodos |
| 3. Catálogo Pantallas | ✅ | 658 pantallas desde PDF |
| 4. AI Assistant | ✅ | FastAPI + DeepSeek + voz |
| 5. Supabase | 📋 | Migración a nube |
| 6. Compatibilidad | 📋 | Matching pantallas ↔ modelos |

---

## Licencia

MIT — Proyecto personal de Roberth Silva (shaman2527).
