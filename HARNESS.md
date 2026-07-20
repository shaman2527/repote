# Harness Engineering — Repote PWA

## ¿Qué es Harness Engineering?

Harness Engineering es el framework de orquestación para proyectos profesionales de software. Este documento define el harness que controla, automatiza y estandariza todo el ciclo de vida del proyecto Repote.

## Pilares del Harness

### 1. CI/CD Pipeline (GitHub Actions)
- **Push a main** → Lint → Build → Deploy a GitHub Pages
- Automatización completa sin intervención manual

### 2. Calidad de Código
- **TypeScript estricto**: tipado fuerte en toda la base de código
- **Oxlint**: linter rápido
- **Arquitectura**: lib → hooks → pages → components

### 3. PWA Mobile-First
- Offline-first con IndexedDB (idb)
- Service Worker con Workbox
- Instalable en Android/iOS/Desktop
- Bottom nav mobile + sidebar desktop

### 4. Datos
- **Fase 1**: IndexedDB local (actual)
- **Fase 2**: Supabase cloud (migración planificada)
- Seed data automático al primer inicio:
  - 200+ modelos con métodos FRP
  - 658 pantallas con precios (extraído del PDF)

### 5. UI/UX
- **shadcn/ui** + Tailwind CSS v4 (tema oscuro)
- **Three.js** fondo 3D interactivo en Dashboard
- **Splide.js** sliders

### 6. AI Assistant (DeepSeek + FastAPI)
- Backend FastAPI para consultas técnicas
- DeepSeek API para respuestas IA sobre FRP y reparación
- Speech-to-text con Web Speech API
- Fallback rule-based cuando no hay API key

### 7. Comandos del Harness

```bash
# Frontend
npm run dev           # Desarrollo
npm run build         # Build producción
npm run lint          # Linting
npm run preview       # Preview build
npm run setup         # Instalación completa + íconos

# Backend (AI Assistant)
cd backend
pip install -r requirements.txt
cp .env.example .env  # Configurar DEEPSEEK_API_KEY
python main.py        # Inicia en :8000
```

## Estructura del Proyecto

```
repote-personal-software-frp/
├── .github/workflows/ci.yml   # CI/CD
├── backend/                    # FastAPI + DeepSeek
├── data/                       # PDF extraído
├── scripts/                    # Herramientas
├── src/
│   ├── components/ui/          # shadcn/ui
│   ├── components/             # Custom (AIAssistant, ThreeBackground, etc.)
│   ├── pages/                  # Dashboard, AddRepair, ListRepairs, etc.
│   ├── hooks/                  # useRepairs, useDebounce
│   ├── lib/                    # db.ts, seed-models.ts
│   └── data/                   # screen_catalog.json (658 screens)
└── public/icons/               # PWA icons
```

## Roadmap

| Fase | Estado | Descripción |
|------|--------|-------------|
| 1. Core App | ✅ | Scaffold, routing, PWA, DB |
| 2. Modelos | ✅ | 200+ modelos con métodos FRP |
| 3. Pantallas | ✅ | 658 pantallas desde PDF con precios |
| 4. AI Assistant | ✅ | FastAPI + DeepSeek + voz |
| 5. Supabase | 📋 | Migración a nube |
| 6. Compatibilidad | 📋 | Matching pantallas ↔ modelos |

---

*Harness Engineering v1.1 — Proyecto Repote*
