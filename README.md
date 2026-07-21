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
- **Registro** con selección de marca → modelo (2.209 modelos precargados)
- **Serie detectada automáticamente** con badge de color (A Series 🔴, Redmi 🟠, Note 🟣, etc.)
- **Cámara** integrada para fotos del equipo
- **Pantallas compatibles sugeridas** al seleccionar un modelo
- **Estado**: pendiente → en proceso → completado → entregado
- **Eliminar** individual o reset total de datos

### 🔓 FRP y Desbloqueo
- Métodos FRP por chipset: **SPD** (Unisoc), **BROM** (MediaTek), **Testpoint** (Qualcomm), **EDL**, **Bypass**
- 2.209 modelos con método FRP preasignado según chipset real
- Chipsets refinados por modelo: Nokia C/G/X, Vivo iQOO, Xiaomi Redmi A, etc.
- AI Assistant para consultas sobre FRP, flasheo y reparación

### 📊 Dashboard y Reportes
- **Dashboard** con fondo 3D interactivo (Three.js)
- **Charts**: Área de ganancias (7 días), Barras de servicios
- **Stats**: pendientes, en proceso, completados, entregados
- **Ganancias**: hoy, semana, mes, total
- **Exportar** a Excel (.xlsx) y CSV

### 🖥️ Catálogo de Pantallas
- 675 pantallas de repuesto con precios MAYOR/DETAL (extraído de PDF real)
- 16 marcas: Samsung, Xiaomi, Huawei, Tecno, Infinix, Motorola, LG, etc.
- Tipos: INCELL, OLED, AMOLED, ORIGINAL con/sin marco
- Estado de stock (disponible/agotado)

### 🏷️ Series Detectadas (30+)
| Serie | Color | Marcas |
|---|---|---|
| **S Series** 🔵 | Azul | Samsung Galaxy S* |
| **A Series** 🔴 | Rojo | Samsung Galaxy A*, Oppo A* |
| **Z Series** 🩷 | Rosa | Samsung Galaxy Z Fold/Flip |
| **Note** 🟣 | Púrpura | Samsung Note, Infinix Note, Realme Note |
| **Redmi Note** 🟠 | Naranja | Xiaomi Redmi Note |
| **Redmi A** 🟠 | Naranja | Xiaomi Redmi A3-A5 (Unisoc/SPD) |
| **iQOO** 🔵 | Azul | Vivo iQOO (Snapdragon) |
| **Reno** 🔵 | Azul | Oppo Reno |
| **Find X/N** 🟣 | Púrpura | Oppo Find |
| **GT Neo** 🔵 | Azul | Realme GT Neo |
| **Narzo** 🟠 | Naranja | Realme Narzo |
| **Nord** 🔵 | Azul | OnePlus Nord |
| **Ace** 🔴 | Rojo | OnePlus Ace |
| **Pixel** 🔵 | Azul | Google Pixel |
| **Edge** 🟣 | Púrpura | Motorola Edge |
| **Razr** 🩷 | Rosa | Motorola Razr |
| **Phantom** 🟣 | Púrpura | Tecno Phantom |
| **Spark** 🔷 | Cian | Tecno Spark |
| **Camon** 🟣 | Púrpura | Tecno Camon |
| **X Series** 🟣 | Púrpura | Vivo X*, Nokia X* |
| **Pura** 🔴 | Rojo | Huawei Pura |
| **Mate** 🔵 | Azul | Huawei Mate |
| Y muchas más (J, M, F, POCO, Pova, Hot, Smart, Stylo, Velvet, Axon, Blade, Nubia...) |

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

**2.209 modelos** en **22 marcas**, extraídos de múltiples fuentes:

| Fuente | Modelos | Marcas |
|---|---|---|
| phonesdata.com (scrape) | 2.592 teléfonos | 22 marcas, 2012-2026 |
| CELL WORLD PDF (pantallas) | 675 screens | 16 marcas con precios reales |
| PhoneSpecsAPI + seed inicial | ~400 | Samsung, Apple, Xiaomi, Huawei, Google |
| Refinamiento manual | 320 chipsets/FRP | Nokia, Vivo iQOO, Xiaomi, TCL, Blackview, etc. |

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
│   ├── screen_catalog.json   # 675 pantallas CELL WORLD (parseadas v2)
│   ├── phonesdata-all.json   # 2.592 teléfonos scrapeados
│   ├── merge-report.txt      # Reporte merge phonesdata vs seed
│   ├── missing-models-ts.txt # Código TS generado
│   └── unlocktool-*.txt      # Intentos de scrape (bloqueado)
├── public/icons/             # PWA icons (SVG + PNG)
├── scripts/                  # Herramientas de extracción
│   ├── extract-pdf.py        # PDF → JSON
│   ├── parse-screens.py      # Parseo de pantallas (v1)
│   ├── parse-screens-v2.py   # Parseo de pantallas (v2, 675 entradas)
│   ├── scrape-phonesdata*.py # Scraper phonesdata.com
│   ├── merge-phonesdata-models.py  # Merge phonesdata → seed, asigna chipsets/FRP
│   ├── check-*.py            # Verificación de cobertura
│   ├── generate-icons.mjs    # Generación iconos PWA
│   └── test-unlocktool-access.py # Test scrape unlocktool (bloqueado)
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
│   │   ├── screen_catalog.json   # 675 pantallas
│   │   └── phone-images.json     # 1.786 imágenes URLs
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useRepairs.ts
│   ├── lib/
│   │   ├── db.ts                 # IndexedDB (idb wrapper)
│   │   ├── seed-models.ts        # 2.209 modelos con FRP
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

# Extracción de datos (harness)
python scripts/extract-pdf.py                    # PDF CELL WORLD → JSON (v1)
python scripts/parse-screens-v2.py               # PDF CELL WORLD → 675 screens (v2)
python scripts/scrape-phonesdata-v2.py           # phonesdata.com → JSON
python scripts/merge-phonesdata-models.py        # phonesdata → seed-models.ts (con chipsets/FRP)
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
| 10. Nuevas Marcas | ✅ | Oppo, Realme, OnePlus, Vivo (22 marcas total) |
| 11. Error Recovery | ✅ | ErrorBoundary + WebGL check |
| 12. CI/CD | ✅ | GitHub Actions + Vercel |
| 13. Merge phonesdata | ✅ | 2.592 → 2.209 modelos únicos con chipsets/FRP |
| 14. Series Detection | ✅ | 30+ series con badges color-coded |
| 15. Pantallas v2 | ✅ | 675 pantallas (parseo PDF mejorado) |
| 16. Filtro por serie | ✅ | Dynamic series dropdown en catálogo |
| 17. Autocomplete debounce | ✅ | 150ms debounce en selector de modelos |
| 18. Chipsets refinados | ✅ | Nokia, Vivo iQOO, TCL, Blackview, Xiaomi Redmi A |
| 19. Supabase | 📋 | Migración a nube |

---

## Licencia

MIT — Proyecto personal de Roberth Silva ([@shaman2527](https://github.com/shaman2527)).
