# Tablero SEA

App web para capturar el **Informe Trimestral sobre la situación de los Sistemas Estatales
Anticorrupción**. 

Cada entidad federativa entra, llena su informe por bloques (A…L) y lo
envía; admins pueden ver avance de las 32, calificaciones y administran los periodos.

## Stack

- **React 19 + TypeScript** front.
- **Vite** bundler / servidor de desarrollo.
- **Tailwind CSS 3**
- **React Router v7** para navegación.
- **TanStack Query (React Query)** para el estado de servidor (caché, loading/error, invalidación).
- **Supabase** (Postgres + RLS) backend.
- **Auth0** para el login, conectado a Supabase vía Third-Party Auth.
- **Lucide** íconos.

## Cómo correr

Se necesita `.env` con las llaves de Supabase y Auth0 (ver `.env.example`)

```bash
cp .env.example .env   # y rellena los valores
```

Luego, desde `tablero-app/`:

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # build de producción (tsc -b + vite build)
npm run preview   # sirve el build local
npm test          # vitest
```

Sin variables de entorno la app arranca pero login y los datos no funcionan.

## Variables de entorno

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=
```

## Estructura del proyecto

```
src/
├── types/index.ts        # interfaces de todos los modelos (FormData, BloqueBData, etc.)
├── data/                 # catálogos: estados, periodos, estructura, bloques
│   └── mockReports.ts    # ya no se usa en runtime; sirvió para sembrar la BD
├── services/             # acceso a datos (promesas para Supabase)
│   ├── reports.ts        # getReports / getReport / saveReport / submitReport
│   ├── estructura.ts
│   ├── periodos.ts
│   └── reference.ts
├── hooks/                # useReports, useEstructura, usePeriodos, useEstados (+ queryKeys)
├── lib/
│   ├── supabase.ts       # cliente; el token de Auth0 se inyecta vía callback accessToken
│   ├── completeness.ts   # deriva status/progreso de cada bloque desde lo capturado
│   ├── scoring.ts        # puntaje del Bloque K (sale del J)
│   ├── validation.ts     # validaciones cruzadas (B vs D, suma de capítulos en F)
│   └── exportCsv.ts       # exportaciones del lado admin
├── auth/AuthSync.tsx     # arma el AppUser desde las claims del token de Auth0
├── contexts/AppContext.tsx  # orquestación: bloque activo, auto-guardado, sesión, toasts
├── components/
│   ├── ui/               # botones, badges, inputs, MoneyInput, etc.
│   ├── layout/           # AppHeader, FormSidebar
│   └── blocks/           # un componente por bloque, BloqueA…BloqueL
└── pages/
    ├── Login.tsx
    ├── reporter/         # Dashboard, CaptureForm, ReviewSubmit, Confirmation
    └── admin/            # NationalDashboard, ReportDetail, StructureEditor, PeriodManagement
```

## Roles

Se resuelven desde la identidad

- **Reporter** — ve solo su entidad, captura y envía su informe.
- **Admin** — ve las 32, consulta envíos, edita por sección, administra estructura y periodos.

El rol y el `estado_id` salen de las claims del token de Auth0 (las pone un Action desde
`app_metadata`). Esas claims se usan para enrutar y pintar la UI; la **fuente de verdad para RLS
es la tabla `profiles`** en la base.

## Login (Auth0 + Supabase)

El botón de la pantalla de Login dispara `loginWithRedirect()` de Auth0; no hay registro público,
las cuentas se aprovisionan a mano (ver `auth0/`). Una vez con sesión, el cliente de Supabase
adjunta el access token de Auth0 en cada llamada (callback `accessToken` en `lib/supabase.ts`), y
Postgres aplica RLS por rol/entidad sobre ese `sub`.

## Auto-guardado y sesión

- El auto-guardado es debounced a ~2s después del último cambio (antes era un intervalo fijo).
  Todas las escrituras pasan por un mismo `persistReport` y se serializan para que un guardado
  manual y uno automático no se pisen.
- La sesión cierra por inactividad a los 30 min, con una cuenta regresiva de 1 minuto antes.

## Validaciones cruzadas (corren en el cliente)

1. **Bloque B vs D** — los integrantes vigentes no pueden pasar de los que contempla la ley.
   El error sale inline en el Bloque D.
2. **Bloque F** — la suma de los capítulos 1000–9000 debe cuadrar con el presupuesto SESEA 2026.
   Hay un totalizador en vivo con semáforo de color.
3. **Bloque K** — el puntaje se calcula en tiempo real a partir del Bloque J (25 pts por criterio
   cumplido). Alto ≥ 75, Medio ≥ 25, Bajo < 25.

El status/progreso de cada bloque lo deriva `lib/completeness.ts` de lo capturado.

## Docker

El `Dockerfile` multi-etapa compila el SPA y lo sirve con `serve -s`. Las variables
`VITE_*` entran como build-args para que no entren en runtime.

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=... \
  --build-arg VITE_SUPABASE_ANON_KEY=... \
  --build-arg VITE_AUTH0_DOMAIN=... \
  --build-arg VITE_AUTH0_CLIENT_ID=... \
  --build-arg VITE_AUTH0_AUDIENCE=... \
  -t tablero-sea .

docker run -p 3000:3000 tablero-sea    
```

## Custom tailwind

Custom tokens en `tailwind.config.js`.

| Token | Valor | Para qué |
|---|---|---|
| `guinda-950` | `#691C32` | acento principal, botones primarios, header |
| `guinda-50` | `#fdf2f4` | hover y selección activa |
| `gray-50` | `#f9fafb` | fondo general |
| verde | `green-*` | confirmaciones, estado "completo" |
| ámbar | `amber-*` | advertencias, "borrador" / "incompleto" |
| rojo | `red-*` | errores de validación |
