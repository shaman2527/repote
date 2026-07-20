# Harness Engineering — Repote

## ¿Qué es Harness Engineering?

Es el framework de orquestación que controla, automatiza y estandariza todo el ciclo de vida del proyecto Repote. Cada aspecto del proyecto —código, CI/CD, datos, UI, testing— está orquestado por este harness.

---

## 1. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
on: push → main
  jobs:
    build: lint → build → upload artifact
    deploy: deploy to GitHub Pages
```

- **Push a main** → Lint (oxlint) → Build (Vite) → Deploy (Vercel automático)
- **Vercel** conectado al repo GitHub, deploy automático en cada push
- **URL producción:** https://repote.vercel.app

---

## 2. Arquitectura

```
Frontend (Vite + React) ─→ IndexedDB (local)
                         ─→ FastAPI (IA opcional) ─→ DeepSeek API
```

### Mobile-First PWA
- Offline-first con IndexedDB
- Service Worker con Workbox (12 assets precacheados, ~1.7MB)
- Instalable en Android/iOS/Desktop
- Diseño responsive: bottom nav mobile + sidebar desktop (>768px)

---

## 3. Calidad de Código

| Herramienta | Uso |
|---|---|
| TypeScript 6 | Tipado estricto en toda la base |
| Oxlint | Linter rápido (<1s) |
| shadcn/ui | Componentes atómicos con Radix UI |
| Tailwind v4 | Utilidades + tema oscuro profesional |

### Reglas del Harness
- `@/` path alias para imports
- `cn()` de `clsx` + `tailwind-merge` para clases condicionales
- No emojis en UI — solo Lucide icons
- Componentes shadcn manuales (CLI no funciona en Windows por EPERM)

---

## 4. Datos

### Persistencia
- **Fase 1 (actual):** IndexedDB con `idb` — local, offline, sin servidor
- **Fase 2 (futura):** Supabase — nube, multi-dispositivo, auth

### Seed Data (automático al primer inicio)

| Dataset | Cantidad | Fuente |
|---|---|---|
| Phone models | ~500 | Hardcodeado + datos Venezuela |
| Screen catalog | 658 | Extraído de PDF CELL WORLD |
| FRP methods | Por chipset | Asignado por modelo |

### IndexedDB Stores
- `repairs` — equipos registrados
- `models` — catálogo de modelos
- `screens` — catálogo de pantallas
- `screenCompatibility` — compatibilidad (futuro)

---

## 5. UI / Design System

### Tema
- **Fondo:** `#0a0a0f` (casi negro)
- **Cards:** `#14141a` con glassmorphism (`backdrop-filter: blur(20px)`)
- **Acento:** `#3b82f6` (azul)
- **Texto:** `#f5f5f7`
- **Muted:** `#8e8e93`
- **Tipografía:** `-apple-system, SF Pro Display, Inter`

### Componentes shadcn/ui implementados

| Componente | Base | Props |
|---|---|---|
| Button | Radix Slot | variant (6), size (8), asChild |
| Card | div simple | Header, Title, Description, Content, Footer |
| Select | Radix Root | Trigger, Content, Group, Item, Value |
| Badge | CVA | variant (7), asChild |
| Input | input nativo | — |
| Textarea | textarea nativo | — |
| Label | label nativo | — |
| Separator | div | orientation |
| Dialog | Radix Root | Content, Header, Title, Description, Footer |
| Command | cmdk | Input, List, Empty, Group, Item |
| Chart | div wrapper | + Recharts (Area, Bar, Pie) |

---

## 6. Páginas y Rutas

| Ruta | Página | Componente clave |
|---|---|---|
| `/` | Dashboard | ThreeBackground + Recharts + StatsCard |
| `/add` | Registrar | ModelSelect + CameraCapture |
| `/list` | Lista | StatusBadge + Dialog (confirmación) |
| `/detail/:id` | Detalle | StatusBadge + Edit mode |
| `/report` | Reportes | Recharts (Bar/Pie) + SheetJS export |
| `/screens` | Pantallas | Screen search + brand filter |
| `/models` | Modelos | Model search + FRP badges |

---

## 7. AI Assistant

```
Frontend (Web Speech API) ─→ FastAPI ─→ DeepSeek API (opcional)
                                   └→ Rule-based fallback
```

- **Speech-to-text:** Web Speech API (Chrome Android/Desktop)
- **Backend:** FastAPI en `backend/main.py`
- **Modelo:** deepseek-chat (deepseek-v3)
- **Costo:** ~$0.14/1M input tokens, $0.28/1M output tokens
- **Sin API key:** Fallback rule-based con FRP knowledge base

---

## 8. Comandos

```bash
# Frontend
npm run dev              # Desarrollo :5173
npm run build            # Build producción
npm run preview          # Preview build
npm run lint             # Oxlint
npm run setup            # Instalación completa
npm run icons:generate   # Regenerar icons PWA

# Backend IA
cd backend
pip install -r requirements.txt
python main.py           # API :8000
```

---

## 9. Roadmap

| Fase | Estado | Descripción |
|---|---|---|
| 1. Core App | ✅ | React + Vite + PWA + IndexedDB |
| 2. Modelos | ✅ | 500+ modelos con FRP method |
| 3. Pantallas | ✅ | 658 screens with prices from PDF |
| 4. Dashboard | ✅ | Three.js + Recharts + Stats |
| 5. AI Assistant | ✅ | FastAPI + DeepSeek + Voz |
| 6. Rediseño | ✅ | Apple-style + glassmorphism |
| 7. Error Recovery | ✅ | ErrorBoundary + WebGL check |
| 8. CI/CD | ✅ | GitHub Actions + Vercel |
| 9. Supabase | 📋 | Migración a nube |
| 10. Compatibilidad | 📋 | Pantallas ↔ modelos |

---

## 10. Composición del Repo

```
repote/ (7.8 MB, 60+ archivos)
├── src/          (45 archivos TSX/TS/CSS)
├── backend/      (3 archivos Python)
├── public/       (4 archivos: SVG + PNG)
├── scripts/      (5 scripts Python/JS)
├── data/         (2 archivos: JSON + TXT)
└── configs       (vite, ts, vercel, github, tailwind)
```

---

*Harness Engineering v2.0 — Repote*
