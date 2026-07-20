# Repote

**Control de reparaciones de teléfonos móviles** — PWA mobile-first para talleres de reparación.

Gestiona entradas/salidas, FRP, flasheo, cambio de pantallas y ganancias. App instalable en Android/iOS/Desktop con soporte offline y asistente IA.

**URL producción:** https://repote.vercel.app

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript 6 + Vite 8 |
| UI | shadcn/ui + Radix UI + Tailwind CSS v4 |
| 3D | Three.js (fondo interactivo Dashboard) |
| Charts | Recharts (ganancias, servicios, distribución) |
| Iconos | Lucide React |
| PWA | vite-plugin-pwa (Workbox, offline-first) |
| Persistencia | IndexedDB via idb |
| Export | SheetJS (Excel .xlsx + CSV) |
| Backend IA | FastAPI + DeepSeek API (opcional) |
| CI/CD | GitHub Actions → Vercel (deploy automático) |

---

## Inicio Rápido

```bash
npm install
npm run dev              # http://localhost:5173
```

### Backend IA (opcional)

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env     # Configurar DEEPSEEK_API_KEY
python main.py           # http://localhost:8000
```

### Build producción

```bash
npm run build
npm run preview
```

---

## Funcionalidades

### 📱 Control de Equipos
- **Registro** con selección de marca → modelo (1.200+ modelos precargados)
- **Serie detectada automáticamente** con badge de color (A Series 🔴, Redmi 🟠, Note 🟣, etc.)
- **Cámara** integrada para fotos del equipo
- **Pantallas compatibles sugeridas** al seleccionar un modelo
- **Estado**: pendiente → en proceso → completado → entregado
- **Eliminar** individual o reset total de datos

### 🔓 FRP y Desbloqueo
- Métodos FRP por chipset: **SPD** (Unisoc), **BROM** (MediaTek), **Testpoint** (Qualcomm), **EDL**, **Bypass**
- 1.200+ modelos con método FRP preasignado según chipset
- AI Assistant para consultas sobre FRP, flasheo y reparación

### 📊 Dashboard y Reportes
- **Dashboard** con fondo 3D interactivo (Three.js)
- **Charts**: Área de ganancias (7 días), Barras de servicios
- **Stats**: pendientes, en proceso, completados, entregados
- **Ganancias**: hoy, semana, mes, total
- **Exportar** a Excel (.xlsx) y CSV

### 🖥️ Catálogo de Pantallas
- 658 pantallas de repuesto con precios MAYOR/DETAL (extraído de PDF real)
- 16 marcas: Samsung, Xiaomi, Huawei, Tecno, Infinix, Motorola, LG, etc.
- Tipos: INCELL, OLED, AMOLED, ORIGINAL con/sin marco
- Estado de stock (disponible/agotado)

### 🏷️ Series Detectadas (20+)
| Serie | Color | Marcas |
|---|---|---|
| **A Series** 🔴 | Rojo | Samsung Galaxy A* |
| **S Series** 🔵 | Azul | Samsung Galaxy S* |
| **Note** 🟣 | Púrpura | Samsung Note, Infinix Note |
| **Redmi** 🟠 | Naranja | Xiaomi Redmi / Redmi Note |
| **Spark** 🔷 | Cian | Tecno Spark |
| **Camon** 🟣 | Púrpura | Tecno Camon |
| **Moto G/E** 🔵🟢 | Azul/Verde | Motorola |
| **Pixel** 🔵 | Azul | Google Pixel |
| **Y Series** 🔷 | Cian | Vivo Y, Huawei Y |
| Y muchas más (J, M, F, Z, POCO, Pova, Hot, Smart, Edge, K/Q, etc.) |

### 🤖 AI Assistant (opcional)
- Backend FastAPI con DeepSeek API
- Responde sobre FRP, flasheo, pantallas y reparación
- Entrada por voz (Web Speech API)
- Fallback rule-based sin API key

### 📱 PWA
- Instalable en Android/iOS/Desktop
- Offline-first con Service Worker (Workbox)
- Orientación portrait optimizada
- Icono profesional técnico/reparación (SVG + PNG 192/512)

---

## Catálogo de modelos

**1.200+ modelos** en **24 marcas**, extraídos de múltiples fuentes:

| Fuente | Modelos | Marcas |
|---|---|---|
| PhoneSpecsAPI (GitHub) | ~400 | Samsung, Apple, Xiaomi, Huawei, Google, Nokia |
| CELL WORLD PDF (pantallas) | 658 screens | 16 marcas con precios reales |
| phonesdata.com (scrape) | 2.592 con imágenes | 17 marcas, 2012-2026 |
| Venezuela (conocimiento local) | ~200 | Tecno Spark, Infinix, Motorola, LG, etc. |

### Imágenes
- **1.786 imágenes** de teléfonos descargadas de phonesdata.com
- Almacenadas en `src/data/phone-images.json` listas para UI

---

## Estructura del Proyecto

```
repote/
├── .github/workflows/ci.yml
├── backend/
│   ├── main.py
│   └── requirements.txt
├── data/                     # Datos extraídos
│   ├── screen_catalog.json   # 658 pantallas CELL WORLD
│   ├── phonesdata-all.json   # 2.592 teléfonos scrapeados
│   └── unlocktool-*.txt      # Intentos de scrape (bloqueado)
├── public/icons/             # PWA icons (SVG + PNG)
├── scripts/                  # Herramientas de extracción
│   ├── extract-pdf.py        # PDF → JSON
│   ├── parse-screens.py      # Parseo de pantallas
│   ├── scrape-phonesdata*.py # Scraper phonesdata.com
│   ├── integrate-*.py        # Integración seed data
│   ├── check-*.py            # Verificación de cobertura
│   └── generate-icons.mjs    # Generación iconos PWA
├── src/
│   ├── components/
│   │   ├── ui/               # shadcn/ui (Button, Card, Select, Dialog, Command, Popover...)
│   │   ├── AIAssistant.tsx
│   │   ├── CameraCapture.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ModelSelect.tsx   # Selector con series, badges, pantallas compatibles
│   │   ├── NavBar.tsx
│   │   ├── StatsCard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ThreeBackground.tsx
│   ├── data/
│   │   ├── screen_catalog.json   # 658 pantallas
│   │   └── phone-images.json     # 1.786 imágenes URLs
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useRepairs.ts
│   ├── lib/
│   │   ├── db.ts                 # IndexedDB (idb wrapper)
│   │   ├── seed-models.ts        # 1.200+ modelos con FRP
│   │   ├── screen-compatibility.ts # Matching modelos ↔ pantallas
│   │   └── utils.ts              # cn() utility
│   └── pages/
│       ├── Dashboard.tsx         # Three.js + Recharts + Stats
│       ├── AddRepair.tsx         # Registro con cámara + compatibilidad
│       ├── ListRepairs.tsx       # Filtros + búsqueda + eliminar
│       ├── DetailRepair.tsx      # Edición + estados
│       ├── Report.tsx            # Charts + export Excel/CSV
│       ├── ScreenCatalog.tsx     # Pantallas con precios
│       └── ModelCatalog.tsx      # Modelos con series + FRP
├── index.html
├── vite.config.ts
├── vercel.json
├── components.json              # shadcn/ui config
├── HARNESS.md                   # Orquestación del proyecto
└── README.md
```

---

## Modelo de Datos

```ts
// Registro de reparación
interface Repair {
  id: string
  dateIn: string          // ISO date
  dateOut?: string
  brand: string
  modelName: string
  imei?: string
  serviceType: 'FRP' | 'Software' | 'Cambio pantalla' | 'Batería' | 'Pinout' | 'Otro'
  frpMethodUsed?: 'SPD' | 'BROM' | 'Testpoint' | 'UMT' | 'Octoplus' | 'Bypass' | 'EDL'
  hasTestpointFRP: boolean
  isSoftware: boolean
  screenReplaced: boolean
  screenPrice?: number
  price: number
  totalPrice: number
  status: 'pendiente' | 'en_proceso' | 'completado' | 'entregado'
  photo?: string           // base64 JPEG
  notes?: string
  createdAt: string
  updatedAt: string
}

// Modelo de teléfono (catálogo)
interface PhoneModel {
  id: string
  brand: string
  model: string
  chipset?: string
  frpMethod?: FrpMethod
  year?: number
}

// Pantalla de repuesto (catálogo)
interface ScreenPart {
  id: string
  brand: string
  model: string
  screenType: string      // INCELL | OLED | AMOLED | ORIGINAL | etc.
  wholesalePrice: number  // USD
  retailPrice: number     // USD
  stockStatus: 'disponible' | 'agotado'
}
```

---

## API Backend (FastAPI)

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/chat` | POST | Chat con AI Assistant (DeepSeek) |
| `/api/health` | GET | Health check + stats del catálogo |

### Request `/api/chat`

```json
{
  "message": "método FRP para Tecno Spark 10 Pro",
  "history": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
}
```

### Response

```json
{
  "response": "Para Tecno Spark 10 Pro (MediaTek Helio G88) el método es SPD..."
}
```

### Variables de entorno

| Variable | Descripción |
|---|---|
| `DEEPSEEK_API_KEY` | API key DeepSeek (sin ella usa fallback rule-based) |

---

## Comandos del Harness

```bash
npm run dev              # Desarrollo frontend
npm run build            # Build producción
npm run preview          # Preview build
npm run lint             # Oxlint
npm run setup            # Instalación completa + íconos
npm run icons:generate   # Regenerar íconos PWA

# Backend
cd backend
pip install -r requirements.txt
python main.py           # API en :8000

# Extracción de datos
python scripts/extract-pdf.py               # PDF CELL WORLD → JSON
python scripts/scrape-phonesdata-v2.py      # phonesdata.com → JSON
python scripts/integrate-phonesdata-v2.py   # → seed-models.ts
```

---

## Roadmap

| Fase | Estado | Descripción |
|---|---|---|
| 1. Core App | ✅ | Scaffold, routing, PWA, IndexedDB |
| 2. Modelos FRP | ✅ | 1.200+ modelos con métodos |
| 3. Catálogo Pantallas | ✅ | 658 pantallas desde PDF real |
| 4. Dashboard | ✅ | Three.js + Recharts + stats |
| 5. AI Assistant | ✅ | FastAPI + DeepSeek + voz |
| 6. Rediseño Apple | ✅ | Glassmorphism + Lucide icons |
| 7. Series + Badges | ✅ | 20+ series detectadas con color |
| 8. Compatibilidad | ✅ | Matching pantallas ↔ modelos |
| 9. Imágenes | ✅ | 1.786 fotos de phonesdata.com |
| 10. Nuevas Marcas | ✅ | Oppo, Realme, OnePlus, Vivo |
| 11. Error Recovery | ✅ | ErrorBoundary + WebGL check |
| 12. CI/CD | ✅ | GitHub Actions + Vercel |
| 13. Supabase | 📋 | Migración a nube |

---

## Licencia

MIT — Proyecto personal de Roberth Silva ([@shaman2527](https://github.com/shaman2527)).
