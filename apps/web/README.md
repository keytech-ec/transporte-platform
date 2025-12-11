# Transporte Platform - Web App

Aplicación web pública construida con Next.js 14 (App Router) para la plataforma de transporte.

## Stack Tecnológico

- **Next.js 14** con App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes UI
- **React Query** (@tanstack/react-query) para data fetching
- **Zustand** para estado global
- **React Hook Form** + **Zod** para formularios y validación

## Estructura

```
apps/web/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Landing page
│   │   ├── buscar/             # Búsqueda de viajes
│   │   ├── reservar/           # Selección de asientos y checkout
│   │   ├── confirmacion/       # Confirmación con QR
│   │   └── mis-reservas/       # Consultar reservas
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   └── providers.tsx       # Providers (React Query)
│   ├── lib/
│   │   ├── api.ts              # Cliente API
│   │   ├── utils.ts            # Utilidades
│   │   └── validations.ts      # Esquemas Zod
│   ├── hooks/
│   │   └── use-toast.ts        # Hook para toasts
│   └── stores/
│       └── booking-store.ts    # Store Zustand para reservas
├── public/                     # Archivos estáticos
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` en `apps/web/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Instalación

```bash
# Desde la raíz del proyecto
pnpm install

# O solo para esta app
cd apps/web
pnpm install
```

## Scripts

```bash
# Desarrollo
pnpm dev
# O desde la raíz:
pnpm --filter @transporte-platform/web dev

# Build
pnpm build

# Producción
pnpm start

# Linting
pnpm lint

# Type checking
pnpm type-check
```

## Páginas

### `/` - Landing Page
Página de inicio con información sobre la plataforma y CTA para buscar viajes.

### `/buscar` - Búsqueda de Viajes
Formulario para buscar viajes disponibles con filtros:
- Origen y destino
- Fecha
- Número de pasajeros

### `/reservar/[tripId]` - Selección de Asientos
Visualización del mapa de asientos del vehículo y selección de asientos.

### `/reservar/[tripId]/checkout` - Checkout
Formulario para ingresar información de contacto y pasajeros antes del pago.

### `/confirmacion/[reference]` - Confirmación
Página de confirmación con:
- Número de referencia de reserva
- Código QR
- Detalles del viaje
- Información de pasajeros

### `/mis-reservas` - Consultar Reservas
Búsqueda de reservas por número de referencia.

## Componentes UI

La aplicación usa shadcn/ui con los siguientes componentes instalados:

- `button` - Botones
- `input` - Inputs de formulario
- `card` - Tarjetas
- `dialog` - Modales
- `select` - Selectores
- `calendar` - Calendario para fechas
- `form` - Formularios con React Hook Form
- `toast` - Notificaciones
- `skeleton` - Loading states
- `popover` - Popovers
- `label` - Labels

## Estado Global

Se usa Zustand para manejar el estado de la reserva en curso:

```typescript
import { useBookingStore } from '@/stores/booking-store';

const { selectedTrip, selectedSeats, lockId, setSelectedTrip } = useBookingStore();
```

## API Client

El cliente API está en `src/lib/api.ts` y proporciona métodos para:

- `reservationsApi` - Operaciones de reservas
- `paymentsApi` - Operaciones de pagos

## Validación

Los esquemas de validación están en `src/lib/validations.ts` usando Zod:

- `searchTripsSchema` - Búsqueda de viajes
- `customerSchema` - Información del cliente
- `passengerSchema` - Información de pasajeros
- `reservationSchema` - Creación de reserva
- `bookingReferenceSchema` - Búsqueda por referencia

## Estilos

- **Tailwind CSS** con configuración personalizada
- **Colores de transporte**: Azul y verde profesional definidos en `tailwind.config.ts`
- **Variables CSS** para temas (light/dark) en `globals.css`

## Desarrollo

1. Asegúrate de que la API esté corriendo en `http://localhost:3001`
2. Ejecuta `pnpm dev` desde `apps/web/`
3. Abre `http://localhost:3000`

## Próximos Pasos

- [ ] Agregar manejo de errores más robusto
- [ ] Implementar autenticación de usuarios
- [ ] Agregar tests (unitarios y e2e)
- [ ] Mejorar accesibilidad
- [ ] Optimizar imágenes y assets
- [ ] Agregar PWA support
- [ ] Implementar internacionalización (i18n)

