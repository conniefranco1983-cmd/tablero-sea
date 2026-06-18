# Tablero SEA

Aplicación web para el **Tablero de Captura del Informe Trimestral sobre la situación de los Sistemas Estatales Anticorrupción**.

Nombre corto: **Tablero SEA**.

Desarrollador: **Secretaría Ejecutiva del Sistema Nacional Anticorrupción**.

## Stack tecnológico

- **React 19 + TypeScript**: frontend framework
- **Vite**: bundler y servidor de desarrollo
- **Tailwind CSS 3**: sistema de estilos con tokens personalizados (color guinda institucional)
- **React Router v7**: navegación entre páginas
- **Lucide React**: iconografía

## Arranque local

```bash
cd tablero-app
npm install
npm run dev          # servidor en http://localhost:5173
npm run build        # producción
```

## Estructura del proyecto

```
src/
├── types/index.ts          # Interfaces TypeScript para todos los modelos de datos
├── data/
│   ├── estados.ts          # 32 entidades federativas con titulares y correos
│   ├── periodos.ts         # Períodos trimestrales (2025-Q1 → 2026-Q1)
│   ├── bloques.ts          # Metadatos de los 12 bloques de captura
│   └── mockReports.ts      # Datos ficticios para las 32 entidades (mapeo backend aquí)
├── contexts/
│   └── AppContext.tsx       # Estado global: usuario, formulario, auto-guardado, toasts
├── lib/
│   ├── scoring.ts          # Lógica de puntuación del Bloque K (derivado de J)
│   └── validation.ts       # Validaciones cruzadas (B vs D, suma capítulos F)
├── components/
│   ├── ui/                 # Sistema de diseño: Button, Badge, Input, Toggle, MoneyInput…
│   ├── layout/             # AppHeader, FormSidebar
│   └── blocks/             # Un componente por bloque: BloqueA.tsx … BloqueL.tsx
└── pages/
    ├── Login.tsx
    ├── reporter/           # Dashboard, CaptureForm, ReviewSubmit, Confirmation
    └── admin/              # NationalDashboard, ReportDetail, PeriodManagement
```

## Dónde están los datos mock (para el equipo de backend)

| Archivo | Descripción |
|---|---|
| `src/data/estados.ts` | Catálogo de 32 entidades con id, nombre, titular y correo |
| `src/data/periodos.ts` | Períodos trimestrales con fechas de apertura/cierre |
| `src/data/mockReports.ts` | `MOCK_REPORTS: MockReport[]`, un objeto por entidad con status, progreso, bloqueStatuses y formData |
| `src/types/index.ts` | Interfaces completas: `FormData`, `BloqueBData`, `BloqueFData`, etc. |

La función `buildFullFormData()` en `mockReports.ts` muestra un ejemplo de datos completos realistas para cada bloque. Los campos corresponden exactamente a los tipos en `types/index.ts`.

## Roles de usuario

La aplicación tiene dos roles, seleccionables en el formulario de login mediante un toggle oculto bajo "Solo en desarrollo":

- **Reporter** (`role: 'reporter'`): ve solo su entidad, captura datos, envía reporte final
- **Admin** (`role: 'admin'`): ve las 32 entidades, consulta envíos, edita reportes por sección y gestiona períodos

## Auto-guardado

Simulado con `setInterval` de 10 segundos en `AppContext.tsx`. Actualiza el timestamp `ultimo_guardado` y muestra un toast de confirmación.

## Validaciones cruzadas (funcionan en cliente)

1. **Bloque B vs D**: el número de integrantes vigentes no puede superar los contemplados en ley. Error inline en Bloque D.
2. **Bloque F**: la suma de los capítulos 1000–9000 debe coincidir con el presupuesto SESEA 2026. Totalizador en tiempo real con indicador de color.
3. **Bloque K**: puntaje calculado en tiempo real a partir de las respuestas del Bloque J (25 pts por criterio cumplido). Alto ≥ 75, Medio ≥ 25, Bajo < 25.

## Sistema de diseño

Tokens principales definidos en `tailwind.config.js`:

| Token | Valor | Uso |
|---|---|---|
| `guinda-950` | `#691C32` | Acento principal, botones primarios, header |
| `guinda-50` | `#fdf2f4` | Fondos de hover y selección activa |
| `gray-50` | `#f9fafb` | Fondo general de la aplicación |
| Verde | `green-*` | Confirmaciones, estado "completo" |
| Ámbar | `amber-*` | Advertencias, estado "borrador"/"incompleto" |
| Rojo | `red-*` | Errores de validación |
