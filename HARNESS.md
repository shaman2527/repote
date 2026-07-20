# Harness Engineering — Repote PWA

## ¿Qué es Harness Engineering?

Harness Engineering es el framework de orquestación para proyectos profesionales de software. Este documento define el harness que controla, automatiza y estandariza todo el ciclo de vida del proyecto Repote.

## Pilares del Harness

### 1. CI/CD Pipeline (GitHub Actions)
- **Push a main** → Lint → Build → Deploy a GitHub Pages
- Automatización completa sin intervención manual
- Entornos: production (GitHub Pages)

### 2. Calidad de Código
- **TypeScript estricto**: tipado fuerte en toda la base de código
- **Oxlint**: linter rápido para JS/TS
- **Estructura modular**: lib → hooks → pages → components

### 3. Arquitectura Mobile-First PWA
- Offline-first con IndexedDB (idb wrapper)
- Service Worker con Workbox (vite-plugin-pwa)
- Instalable en Android/iOS/Desktop
- Diseño responsive: bottom nav mobile, sidebar desktop

### 4. Datos y Persistencia
- **Fase 1**: IndexedDB local (actual)
- **Fase 2**: Supabase cloud (migración planificada)
- Datos seed automáticos al primer inicio

### 5. Estándares de UI/UX
- **shadcn/ui** + Tailwind CSS v4
- Temática oscura profesional
- Three.js para visualización 3D en Dashboard
- Splide.js para sliders
- Animaciones sutiles con transiciones CSS

### 6. Comandos del Harness

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run lint         # Linting
npm run preview      # Preview build
npm run setup        # Instalación completa + íconos
```

## Estructura del Proyecto

```
src/
├── lib/           # Utilidades core (db, seed data)
├── hooks/         # Custom hooks React
├── pages/         # Páginas/rutas
├── components/    # Componentes reutilizables
│   └── ui/        # Componentes shadcn/ui
└── utils/         # Utilidades puras
```

## Roadmap

| Fase | Estado | Descripción |
|------|--------|-------------|
| 1. Core App | ✅ | Scaffold, routing, PWA, DB |
| 2. Modelos | ✅ | 200+ modelos precargados con métodos FRP |
| 3. Pantallas | 📋 | Catálogo de pantallas desde PDF |
| 4. Supabase | 📋 | Migración a nube |
| 5. Compatibilidad | 📋 | Matching pantallas ↔ modelos |
| 6. Reportes | ✅ | Export Excel/CSV |

---

*Harness Engineering v1.0 — Proyecto Repote*
