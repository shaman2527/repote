# Repote — Control de Reparaciones Móviles

PWA mobile-first para control de reparaciones de teléfonos, FRP, pantallas y ganancias.

## Stack

- **React 19 + Vite 8** — Frontend moderno y rápido
- **TypeScript 6** — Tipado estricto
- **shadcn/ui + Tailwind CSS v4** — UI profesional
- **Three.js** — Visualización 3D en Dashboard
- **Splide.js** — Sliders
- **IndexedDB (idb)** — Persistencia offline local
- **PWA** — Instalable, offline-first
- **SheetJS** — Export a Excel
- **GitHub Actions** — CI/CD full pipeline

## Inicio Rápido

```bash
npm install
npm run dev
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo |
| `npm run build` | Build producción |
| `npm run lint` | Linting |
| `npm run setup` | Instalación completa |
| `npm run icons:generate` | Generar íconos PWA |

## Despliegue

Push a `main` → CI/CD deploy automático a GitHub Pages.

## Harness

Ver [HARNESS.md](./HARNESS.md) para la orquestación del proyecto.
