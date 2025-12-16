# Transporte Platform

Monorepo para plataforma de transporte usando pnpm workspaces y Turborepo.

## Actualizaciones Recientes

### Diciembre 2025 - Sistema de Punto de Venta (POS) - Fase 1: Schema
- ✅ **Schema actualizado para ventas manuales**: Base de datos preparada para sistema de punto de venta
  - **Nuevos enums**: `SaleChannel` (ONLINE, POS_CASH, POS_TRANSFER, POS_CARD, PHONE), `PaymentMethod` (CASH, BANK_TRANSFER, CREDIT_CARD, DEBIT_CARD, DEUNA, PAYPHONE)
  - **Reservation**: Campos agregados: `soldById` (vendedor que creó la venta), `saleChannel`, `passengerFormToken` (token único para formulario público), `passengerFormExpiresAt` (72 horas), `passengerFormCompletedAt`, `notes` (notas del vendedor)
  - **Transaction**: Campos agregados: `receivedBy` (vendedor que recibió el pago), `paymentMethod`, `isPartialPayment` (soporte para pagos parciales), `receiptNumber` (número de recibo manual)
  - **User**: Campos agregados: `salesCount`, `totalSalesAmount` (estadísticas de ventas por vendedor)
  - **Passenger**: Campo agregado: `documentType` (CEDULA, PASSPORT, RUC)
  - **Flujo habilitado**: Vendedor crea reserva → registra pago → genera link de formulario → cliente completa datos de pasajeros

### Diciembre 2025 - Implementación Completa de CRUD Backend y Corrección de Dashboard
- ✅ **Backend API CRUD Completo**: Implementación de operaciones CRUD completas usando Prisma para módulos principales
  - **Vehículos**: CRUD completo con validaciones, ordenamiento por fecha de creación, error handling con NotFoundException
  - **Servicios**: CRUD completo con relaciones (provider, serviceType), conversión automática de Decimal a número, ordenamiento
  - **Viajes**: CRUD completo con relaciones (service, vehicle), conversión de pricePerSeat Decimal, ordenamiento por fecha de salida
  - **Dashboard API**: Endpoints `/stats` y `/reservations-chart` para métricas en tiempo real y visualización de datos
- ✅ **Corrección de errores en Dashboard**: Solucionado error "filteredVehicles.map is not a function" causado por endpoints que retornaban mensajes en lugar de arrays
- ✅ **Conversión automática de tipos Prisma**: Todos los campos Decimal (basePrice, pricePerSeat) se convierten automáticamente a números para compatibilidad con frontend
- ✅ **Hydration fix en autenticación**: Corregido loop de redirección en login del dashboard causado por verificación prematura del estado de autenticación antes de la hidratación de Zustand desde localStorage
- ✅ **API Response Unwrapping**: Interceptor de Axios automáticamente desempaqueta respuestas del backend `{success: true, data: {...}}` para simplificar uso en frontend

### Diciembre 2025 - Dashboard Administrativo Completo
- ✅ **Dashboard administrativo completamente funcional**: Aplicación Next.js 14 independiente para gestión de la plataforma
- ✅ **Autenticación JWT integrada**: Login con email/contraseña, protección de rutas, persistencia de sesión con Zustand
- ✅ **Dashboard Home con analytics**: Tarjetas de métricas (reservas, ingresos, ocupación), gráfico de reservas (Recharts), listas de reservas recientes y próximos viajes
- ✅ **CRUD de Vehículos**: Gestión completa con búsqueda, filtros, modales de creación/edición, validación de formularios
- ✅ **CRUD de Servicios**: Gestión de rutas con búsqueda por origen/destino, filtros por tipo (Directo/Con Paradas), gestión de precios y duración
- ✅ **CRUD de Viajes**: Vista dual (Calendario mensual + Lista), creación de viajes seleccionando servicio/vehículo/horarios, indicadores de ocupación con badges de colores
- ✅ **Gestión de Reservas**: Visualización con estadísticas, búsqueda por referencia/pasajero, filtros por estado, acciones rápidas (confirmar/cancelar)
- ✅ **Componentes profesionales**: Sidebar con navegación, header con dropdown de usuario, tablas responsivas con TanStack Table, modales, notificaciones toast, badges de estado
- ✅ **Cliente API completo**: Axios con interceptores JWT automáticos, manejo de errores 401, métodos CRUD para todos los recursos

### Diciembre 2025 - Actualización Crítica de Seguridad
- 🔐 **Next.js actualizado a 14.2.35**: Corrección de vulnerabilidades críticas CVE-2025-66478 (RCE CVSS 10.0), CVE-2025-29927 (Middleware bypass), y CVE-2025-67779 (DoS). **Actualización obligatoria desde versiones 14.0.x-14.1.x**

### Diciembre 2025 - Mejoras de UX en Flujo de Reserva
- ✅ **Cálculo de precio en tiempo real**: La selección de asientos muestra el precio total actualizado instantáneamente al seleccionar/deseleccionar asientos
- ✅ **Resumen de compra en checkout**: Panel lateral con detalles completos del viaje, asientos seleccionados, desglose de precios y total a pagar
- ✅ **Visualización de asignación asiento-pasajero**: Cada formulario de pasajero muestra claramente el asiento asignado, con mapa visual en el resumen de compra
- ✅ **Cancelación de reservas**: Los usuarios pueden cancelar reservas pendientes o confirmadas desde "Mis Reservas" con diálogo de confirmación, liberación automática de asientos (cambia status de TripSeats a AVAILABLE e incrementa availableSeats del viaje), y notificaciones toast. Los asientos cancelados vuelven a estar disponibles inmediatamente para nuevas reservas
- ✅ **Página de confirmación mejorada**: Muestra claramente la ruta (origen → destino), asientos asignados a cada pasajero con badges visuales, fecha/hora de salida formateada correctamente, y botón funcional de descarga que permite guardar el comprobante como PDF usando la funcionalidad de impresión del navegador
- ✅ **Filtros de búsqueda avanzados**: Panel lateral de filtros con acordeón que permite filtrar viajes por horario (mañana 6-12, tarde 12-18, noche 18-6), rango de precio (min-max ajustable), y tipo de vehículo (Bus, Minibus, Van, Bus de dos pisos, SUV). Los filtros usan conversión UTC a hora local para mostrar horarios correctos y se aplican en tiempo real con contador de resultados filtrados. Incluye botón "Limpiar" para resetear todos los filtros
- ✅ **Auto-completado "Soy uno de los pasajeros"**: Checkbox en el checkout que sincroniza automáticamente y en tiempo real los datos de contacto del cliente con el primer pasajero. Funciona bidireccionalmente: si se marca primero el checkbox y luego se llenan datos, o si se llenan datos primero y luego se marca el checkbox. Incluye indicador visual de auto-completado con fondo azul claro y etiqueta "(Auto-completado)"
- ✅ **Formulario de búsqueda en landing page**: Formulario de búsqueda completo integrado en el Hero section de la página principal. Los usuarios pueden buscar viajes directamente desde la landing sin navegar a otra página. Incluye campos para origen, destino, fecha (con calendario), y número de pasajeros. Al enviar redirige a /buscar con los parámetros de búsqueda y resultados filtrados
- ✅ **Footer profesional con información de contacto**: Footer completo con 4 secciones (Información de la empresa, Enlaces rápidos, Soporte, Contacto), íconos de redes sociales (Facebook, Instagram, Twitter), información de contacto (dirección, teléfono, email), y enlaces a páginas importantes. Integrado en todas las páginas usando layout flex con sticky footer
- ✅ **Sección de rutas populares**: Sección visual en la landing page mostrando las 3 rutas más populares (Cuenca-Guayaquil, Quito-Guayaquil, Cuenca-Loja) con tarjetas con degradados de colores, precio desde, duración aproximada, y botón "Ver horarios" que pre-llena el formulario de búsqueda con la ruta seleccionada
- ✅ **Visualización de amenidades del vehículo**: Los resultados de búsqueda ahora muestran las amenidades disponibles en cada vehículo (WiFi, A/C, Baño, TV) con íconos visuales y badges de colores. Solo se muestran las amenidades disponibles para cada vehículo

### Diciembre 2025 - Correcciones de Compatibilidad Frontend-Backend y Timezone
- ✅ **Conversión de tipos Decimal de Prisma**: Todos los campos Decimal (`pricePerSeat`, `subtotal`, `total`, `commission`, `amount`, etc.) ahora se convierten automáticamente a números JavaScript usando `.toNumber()` antes de ser enviados al frontend
- ✅ **Corrección de estructura de datos**: Ajustada la respuesta de `searchTrips()` para exponer `origin` y `destination` en el nivel superior del objeto viaje
- ✅ **Corrección de timezone en búsqueda de viajes**: El backend ahora parsea fechas en timezone local en lugar de UTC, evitando búsquedas del día anterior
- ✅ **Corrección de timezone en calendario**: El frontend usa `parseISO()` para manejar fechas correctamente en timezone local
- ✅ **Validación inteligente de pasajeros**: El sistema captura el número de pasajeros al realizar la búsqueda, previene desajustes si se cambia el formulario sin re-buscar, ajusta automáticamente a los asientos disponibles, y notifica al usuario cuando hay asientos limitados
- ✅ **Frontend de búsqueda funcional**: La página `/buscar` ahora muestra correctamente los viajes disponibles con toda su información (ruta, horarios, precios, asientos disponibles)
- ✅ **Seed actualizado**: Ahora genera viajes de prueba para los próximos 7 días (28 viajes totales)
- ✅ **Documentación actualizada**: Agregadas guías de buenas prácticas para el manejo de tipos Decimal y troubleshooting de errores comunes

## Estructura

```
transport-platform/
├── apps/
│   ├── api/           # NestJS 10 + Prisma
│   ├── web/           # Next.js 14 App Router
│   └── dashboard/     # Next.js 14 App Router
├── packages/
│   ├── database/      # Prisma schema
│   ├── shared/        # Tipos TypeScript compartidos
│   └── ui/            # Componentes React compartidos (shadcn/ui)
└── docker/            # Docker compose configuration
```

## Requisitos

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker y Docker Compose (para base de datos)

## Instalación

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
# Copia los archivos .env.example a .env en cada ubicación:
cp .env.example .env                    # Root (opcional, para Prisma)
cp apps/api/.env.example apps/api/.env # API backend
cp apps/web/.env.example apps/web/.env.local # Frontend web

# O en Windows PowerShell:
Copy-Item .env.example .env
Copy-Item apps\api\.env.example apps\api\.env
Copy-Item apps\web\.env.example apps\web\.env.local

# Los archivos .env.example contienen valores por defecto para desarrollo.
# Ajusta los valores según sea necesario (especialmente JWT_SECRET en producción).

# 3. Iniciar servicios Docker (PostgreSQL y Redis)
docker-compose -f docker/docker-compose.yml up -d

# 4. Configurar base de datos
# Generar cliente de Prisma
pnpm --filter @transporte-platform/database generate

# Ejecutar migraciones (desde la raíz del proyecto)
pnpm --filter @transporte-platform/database migrate

# 5. Seed de base de datos (opcional)
# Nota: El seed requiere bcrypt para hashear contraseñas (ya incluido en package.json)
pnpm db:seed

# 6. Construir todos los packages (IMPORTANTE)
# Este paso es necesario para compilar el API y los packages compartidos
pnpm build

# 7. Iniciar el servidor de desarrollo
# OPCIÓN A: Iniciar todos los servicios (recomendado)
pnpm dev

# OPCIÓN B: Iniciar servicios individuales en terminales separadas
# Terminal 1 - API Backend
pnpm --filter @transporte-platform/api start

# Terminal 2 - Frontend Web
pnpm --filter @transporte-platform/web dev
```

**IMPORTANTE**: Siempre ejecuta `pnpm build` después de instalar dependencias o hacer cambios en los packages compartidos (database, shared, ui). Esto compila el código TypeScript a JavaScript para que pueda ser ejecutado correctamente.

### Configuración inicial de la base de datos

Si es la primera vez que configuras el proyecto:

```bash
# 1. Iniciar servicios Docker
docker-compose -f docker/docker-compose.yml up -d

# 2. Generar cliente de Prisma (desde la raíz)
pnpm --filter @transporte-platform/database generate

# 3. Aplicar migraciones
pnpm --filter @transporte-platform/database migrate

# 4. (Opcional) Ejecutar seed para datos de prueba
pnpm db:seed
```

## Scripts

### Scripts generales
- `pnpm dev` - Inicia todos los servicios en modo desarrollo
- `pnpm build` - Construye todos los packages y apps
- `pnpm lint` - Ejecuta linters en todos los packages
- `pnpm test` - Ejecuta tests en todos los packages

### Scripts de base de datos
- `pnpm db:migrate` - Ejecuta migraciones de Prisma (desde la raíz)
- `pnpm db:seed` - Ejecuta seed de base de datos (desde la raíz)
- `pnpm db:studio` - Abre Prisma Studio (desde la raíz)

### Scripts de Prisma (desde packages/database)
- `pnpm migrate` - Crea y aplica una nueva migración
- `pnpm migrate:deploy` - Aplica migraciones en producción
- `pnpm migrate:reset` - Resetea la base de datos y aplica todas las migraciones
- `pnpm generate` - Genera el cliente de Prisma
- `pnpm seed` - Ejecuta el seed de la base de datos
- `pnpm studio` - Abre Prisma Studio

## Desarrollo

### Iniciar todos los servicios

```bash
# Desde la raíz del proyecto (recomendado)
pnpm dev
```

### Ejecutar servicios individuales

**IMPORTANTE**: Antes de ejecutar servicios individuales, asegúrate de haber compilado todos los packages:

```bash
# Construir todos los packages primero
pnpm build
```

Luego, ejecuta cada servicio en terminales separadas:

```bash
# Terminal 1 - API Backend (modo producción, más estable)
pnpm --filter @transporte-platform/api start

# Terminal 2 - Frontend Web (modo desarrollo con hot reload, puerto 3000)
pnpm --filter @transporte-platform/web dev

# Terminal 3 - Dashboard (modo desarrollo, puerto 3002)
pnpm --filter @transporte-platform/dashboard dev
```

**Nota sobre el modo dev del API**: El comando `pnpm --filter @transporte-platform/api dev` puede tener problemas con el modo watch de NestJS en el entorno de monorepo. Se recomienda usar `pnpm build` seguido de `pnpm start` para mayor estabilidad.

### URLs de Acceso

Una vez que todos los servicios estén corriendo:

- **API Backend**: `http://localhost:3001/api` (Swagger docs: `http://localhost:3001/api/docs`)
- **Frontend Web** (Público): `http://localhost:3000`
- **Dashboard Admin**: `http://localhost:3002`

## API Backend (NestJS)

La API backend está construida con NestJS 10 y proporciona endpoints RESTful para toda la plataforma.

### Estructura

```
apps/api/
├── src/
│   ├── main.ts                 # Bootstrap de la aplicación
│   ├── app.module.ts           # Módulo principal
│   ├── common/                 # Utilidades comunes
│   │   ├── decorators/        # Decoradores personalizados (@Public, @GetUser)
│   │   ├── filters/           # Filtros de excepciones globales
│   │   ├── guards/            # Guards de autenticación/autorización (JWT)
│   │   ├── interceptors/      # Interceptores de respuesta
│   │   └── pipes/             # Pipes de validación
│   ├── config/                # Configuración
│   │   └── configuration.ts   # Configuración de variables de entorno
│   ├── modules/               # Módulos de negocio
│   │   ├── auth/              # Autenticación (completamente implementado)
│   │   │   ├── decorators/   # @CurrentUser, @Roles
│   │   │   ├── guards/       # RolesGuard
│   │   │   ├── strategies/   # JwtStrategy, LocalStrategy
│   │   │   └── dto/          # LoginDto, RegisterDto
│   │   ├── providers/         # CRUD proveedores
│   │   ├── vehicles/          # CRUD vehículos
│   │   ├── services/          # CRUD servicios/rutas
│   │   ├── trips/             # CRUD viajes programados
│   │   ├── reservations/      # Reservas (completamente implementado)
│   │   │   ├── dto/          # DTOs para búsqueda, bloqueo, creación
│   │   │   ├── exceptions/   # Excepciones personalizadas de negocio
│   │   │   ├── utils/        # Utilidades (generación de booking reference)
│   │   │   └── seat-lock-scheduler.service.ts  # Scheduler para liberar asientos
│   │   ├── payments/          # Pagos (completamente implementado)
│   │   │   ├── dto/          # DTOs para creación de links de pago
│   │   │   ├── gateways/     # Integraciones con DeUNA y Payphone
│   │   │   │   ├── payment-gateway.interface.ts
│   │   │   │   ├── deuna.gateway.ts
│   │   │   │   └── payphone.gateway.ts
│   │   │   └── webhooks/     # Handlers de webhooks
│   │   │       ├── deuna.webhook.ts
│   │   │       └── payphone.webhook.ts
│   │   └── customers/         # CRUD clientes
│   └── prisma/                # Servicio de Prisma
│       ├── prisma.service.ts
│       └── prisma.module.ts
├── test/                      # Tests (unitarios y e2e)
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env                       # Variables de entorno
```

### Características

- ✅ **NestJS 10** con TypeScript strict mode
- ✅ **Prisma ORM** integrado con `@transporte-platform/database`
- ✅ **ConfigModule** con validación de variables de entorno
- ✅ **Global Exception Filter** para manejo consistente de errores
- ✅ **Response Interceptor** para formato de respuesta uniforme
- ✅ **ValidationPipe global** con `class-validator` y `class-transformer`
- ✅ **Swagger/OpenAPI** documentación en `/api/docs`
- ✅ **CORS** habilitado y configurable
- ✅ **Helmet** para seguridad HTTP
- ✅ **JWT Authentication** completamente implementado con Passport strategies
- ✅ **Sistema de roles** (SUPER_ADMIN, PROVIDER_ADMIN, OPERATOR, VIEWER)
- ✅ **Guards y decoradores** para protección de rutas y autorización
- ✅ **8 módulos base** con estructura completa (controller, service, DTOs)
- ✅ **Módulo de Reservas** completamente funcional con todas las operaciones críticas
- ✅ **Módulo de Pagos** completamente funcional con integración a DeUNA y Payphone
- ✅ **Scheduler de asientos** para liberar automáticamente bloqueos expirados (cada minuto)
- ✅ **Sistema de comisiones** automático basado en provider.commissionRate
- ✅ **Conversión automática de Prisma Decimal a números** para compatibilidad con frontend

### Buenas Prácticas de Desarrollo

#### Manejo de Tipos Decimal de Prisma

Los campos de tipo `Decimal` en Prisma (como `pricePerSeat`, `subtotal`, `total`, `commission`, etc.) deben ser convertidos a números JavaScript antes de ser retornados en las respuestas de la API. Esto es crucial para la compatibilidad con el frontend.

**Ejemplo correcto**:
```typescript
// ❌ INCORRECTO - Retorna objeto Decimal de Prisma
return {
  pricePerSeat: trip.pricePerSeat,  // Esto causará errores en el frontend
};

// ✅ CORRECTO - Convierte a número JavaScript
return {
  pricePerSeat: trip.pricePerSeat.toNumber(),  // Compatible con frontend
};
```

**Campos que requieren conversión**:
- Todos los campos de precio: `pricePerSeat`, `basePrice`
- Campos financieros de reservas: `subtotal`, `commission`, `total`
- Campos de transacciones: `amount`, `commission`, `providerAmount`
- Tasas: `commissionRate`

**Dónde aplicar la conversión**:
- En los métodos de servicio que retornan datos a los controladores
- Antes de mapear objetos de Prisma a DTOs de respuesta
- En todos los endpoints que retornan información financiera

### Configuración

La API requiere un archivo `.env` en `apps/api/`. Puedes copiar el archivo de ejemplo:

```bash
# Linux/Mac
cp apps/api/.env.example apps/api/.env

# Windows PowerShell
Copy-Item apps\api\.env.example apps\api\.env
```

El archivo `.env.example` contiene todas las variables necesarias con valores por defecto para desarrollo:

```env
# Server
PORT=3001

# Database
# Can inherit from root .env or specify here
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transporte_db?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="*"

# Payment Gateways (optional for MVP - if not configured, works in mock mode)
# DeUNA Gateway
# DEUNA_API_KEY=your-deuna-api-key
# DEUNA_WEBHOOK_SECRET=your-deuna-webhook-secret
# DEUNA_BASE_URL=https://api.deuna.com

# Payphone Gateway
# PAYPHONE_TOKEN=your-payphone-token
# PAYPHONE_STORE_ID=your-payphone-store-id
# PAYPHONE_WEBHOOK_SECRET=your-payphone-webhook-secret
# PAYPHONE_BASE_URL=https://pay.payphonetodoesposible.com

# App URL (for payment callbacks)
APP_URL=http://localhost:3000
```

**Nota**: El archivo `.env` de la API puede heredar `DATABASE_URL` del `.env` de la raíz del proyecto si está configurado.

**Nota sobre Pagos**: Si no se configuran las credenciales de los gateways de pago, el sistema funcionará en modo mock para desarrollo, generando URLs de pago ficticias y confirmando pagos automáticamente después de 5 segundos.

### Endpoints

- **API Base**: `http://localhost:3001/api`
- **Swagger Documentation**: `http://localhost:3001/api/docs`

### Módulos Disponibles

#### 1. Auth (`/api/auth`)
- `POST /api/auth/login` - Iniciar sesión (público)
  - Valida email + password
  - Retorna JWT con: userId, email, role, providerId
  - Token expira en 7 días
- `POST /api/auth/register` - Registrar nuevo usuario (solo SUPER_ADMIN)
  - Crea usuario vinculado a un provider
  - Hashea password con bcrypt
  - Requiere autenticación JWT y rol SUPER_ADMIN
- `GET /api/auth/me` - Obtener datos del usuario actual (autenticado)
  - Retorna datos del usuario incluyendo provider si aplica
- `POST /api/auth/refresh` - Renovar token JWT (autenticado)

#### 2. Providers (`/api/providers`)
- `GET /api/providers` - Listar todos los proveedores
- `GET /api/providers/:id` - Obtener proveedor por ID
- `POST /api/providers` - Crear proveedor
- `PUT /api/providers/:id` - Actualizar proveedor
- `DELETE /api/providers/:id` - Eliminar proveedor

#### 3. Vehicles (`/api/vehicles`) ✅ **COMPLETAMENTE IMPLEMENTADO**
- `GET /api/vehicles` - Listar todos los vehículos
  - Retorna array de vehículos ordenados por fecha de creación (más recientes primero)
  - No requiere autenticación (público para dashboard)
- `GET /api/vehicles/:id` - Obtener vehículo por ID
  - Retorna 404 si no existe
- `POST /api/vehicles` - Crear vehículo (autenticado)
  - Requiere: providerId, plate, brand, model, year, totalSeats, type
  - Opcionales: seatLayout, amenities
- `PUT /api/vehicles/:id` - Actualizar vehículo (autenticado)
  - Valida existencia antes de actualizar
- `DELETE /api/vehicles/:id` - Eliminar vehículo (autenticado)
  - Valida existencia antes de eliminar

#### 4. Services (`/api/services`) ✅ **COMPLETAMENTE IMPLEMENTADO**
- `GET /api/services` - Listar todos los servicios/rutas
  - Incluye relaciones: provider, serviceType
  - Convierte basePrice (Decimal) a número para frontend
  - Ordenados por fecha de creación (más recientes primero)
- `GET /api/services/:id` - Obtener servicio por ID
  - Incluye relaciones completas
  - Retorna 404 si no existe
- `POST /api/services` - Crear servicio (autenticado)
  - Requiere: providerId, serviceTypeId, origin, destination, name, basePrice, duration
- `PUT /api/services/:id` - Actualizar servicio (autenticado)
  - Valida existencia antes de actualizar
- `DELETE /api/services/:id` - Eliminar servicio (autenticado)
  - Valida existencia antes de eliminar

#### 5. Trips (`/api/trips`) ✅ **COMPLETAMENTE IMPLEMENTADO**
- `GET /api/trips` - Listar todos los viajes programados
  - Incluye relaciones: service, vehicle
  - Convierte pricePerSeat (Decimal) a número para frontend
  - Ordenados por fecha de salida (más recientes primero)
- `GET /api/trips/:id` - Obtener viaje por ID
  - Incluye relaciones completas
  - Retorna 404 si no existe
- `POST /api/trips` - Crear viaje programado (autenticado)
  - Requiere: serviceId, vehicleId, departureDate, departureTime, totalSeats, pricePerSeat, bookingMode
- `PUT /api/trips/:id` - Actualizar viaje (autenticado)
  - Valida existencia antes de actualizar
- `DELETE /api/trips/:id` - Eliminar viaje (autenticado)
  - Valida existencia antes de eliminar

#### 6. Reservations (`/api/reservations`) ✅ **COMPLETAMENTE IMPLEMENTADO**
- `GET /api/reservations/trips/search` - Buscar viajes disponibles
  - Query params: `origin`, `destination`, `date` (YYYY-MM-DD), `passengers`
  - Retorna viajes con asientos disponibles >= passengers
  - Incluye precio, horario, vehículo, amenities
- `GET /api/reservations/trips/:tripId/seats` - Obtener mapa de asientos de un viaje
  - Retorna estado de cada asiento (available/locked/confirmed/reserved/blocked)
  - Incluye información del viaje (origin, destination, departureDate, departureTime)
  - Incluye precio por asiento para cálculos en frontend
  - Incluye layout para renderizar en frontend
- `POST /api/reservations/lock-seats` - Bloquear asientos para checkout
  - Body: `{ tripId, seatIds: string[] }`
  - Cambia status a LOCKED con expiración de 15 minutos
  - Retorna `lockId` para continuar checkout
- `POST /api/reservations` - Crear reserva
  - Body: `{ tripId, lockId, seatIds, customer, passengers, reservationType }`
  - Valida que asientos sigan bloqueados por lockId
  - Crea Customer si no existe
  - Crea Reservation + Passengers + ReservationSeats
  - Genera `bookingReference` único (ej: CUE8X9Z2P)
  - Calcula subtotal, commission, total
- `PATCH /api/reservations/:id/confirm` - Confirmar reserva (después del pago)
  - Cambia status a CONFIRMED
  - Cambia TripSeat.status a CONFIRMED
- `PATCH /api/reservations/:id/cancel` - Cancelar reserva
  - Solo si status es PENDING o CONFIRMED
  - Libera asientos (status = AVAILABLE)
  - Marca para reembolso si ya pagó
- `GET /api/reservations/by-reference/:reference` - Obtener reserva por bookingReference
  - Retorna toda la información de la reserva para el cliente
- `GET /api/reservations` - Listar todas las reservas (legacy)
- `GET /api/reservations/:id` - Obtener reserva por ID (legacy)

#### 7. Payments (`/api/payments`) ✅ **COMPLETAMENTE IMPLEMENTADO**
- `POST /api/payments/create-link` - Crear link de pago para una reserva
  - Body: `{ reservationId, gateway: 'DEUNA' | 'PAYPHONE' }`
  - Genera link de pago con el gateway seleccionado
  - Guarda Transaction con status PENDING
  - Calcula comisiones automáticamente (commission = total * provider.commissionRate / 100)
  - Retorna `paymentUrl` para redirigir al usuario
- `POST /api/payments/webhooks/deuna` - Webhook de DeUNA (público)
  - Recibe notificación de DeUNA
  - Valida firma HMAC
  - Actualiza Transaction.status
  - Si exitoso: confirma reserva automáticamente
  - Retorna 200 OK
- `POST /api/payments/webhooks/payphone` - Webhook de Payphone (público)
  - Similar a DeUNA webhook
  - Valida firma HMAC
  - Actualiza Transaction.status y confirma reserva si es exitoso
- `GET /api/payments/reservation/:reservationId` - Obtener estado del pago por ID de reserva
  - Retorna información de la reserva y última transacción
- `GET /api/payments/transaction/:id` - Obtener transacción por ID
  - Retorna detalles completos de la transacción
- `POST /api/payments/:id/refund` - Iniciar proceso de reembolso
  - Solo SUPER_ADMIN o PROVIDER_ADMIN
  - Actualiza Transaction.status a REFUNDED
  - Actualiza Reservation.status a REFUNDED

#### 8. Customers (`/api/customers`)
- `GET /api/customers` - Listar todos los clientes
- `GET /api/customers/:id` - Obtener cliente por ID
- `POST /api/customers` - Crear cliente
- `PUT /api/customers/:id` - Actualizar cliente
- `DELETE /api/customers/:id` - Eliminar cliente

#### 9. Dashboard (`/api/dashboard`) ✅ **COMPLETAMENTE IMPLEMENTADO**
- `GET /api/dashboard/stats` - Obtener métricas del dashboard (autenticado)
  - Retorna estadísticas en tiempo real:
    - `todayReservations`: Número de reservas creadas hoy
    - `monthlyRevenue`: Ingresos del mes actual (solo reservas CONFIRMED)
    - `averageOccupancy`: Porcentaje promedio de ocupación de viajes
    - `upcomingTrips`: Número de viajes programados en las próximas 24 horas
- `GET /api/dashboard/reservations-chart?days=7` - Obtener datos para gráfico de reservas (autenticado)
  - Query params: `days` (opcional, por defecto 7)
  - Retorna array de datos para gráfico: `[{ day: 'Mon', reservations: 5 }, ...]`
  - Agrupa reservas por día durante el período especificado

### Scripts de la API

```bash
# Desarrollo (watch mode)
pnpm --filter @transporte-platform/api dev

# Build
pnpm --filter @transporte-platform/api build

# Ejecutar producción
pnpm --filter @transporte-platform/api start:prod

# Tests
pnpm --filter @transporte-platform/api test
pnpm --filter @transporte-platform/api test:e2e

# Linting
pnpm --filter @transporte-platform/api lint

# Type checking
pnpm --filter @transporte-platform/api type-check
```

### Documentación Swagger

Una vez que la API esté ejecutándose, puedes acceder a la documentación interactiva de Swagger en:

```
http://localhost:3001/api/docs
```

La documentación incluye:
- Descripción de todos los endpoints
- Esquemas de request/response
- Ejemplos de DTOs
- Autenticación Bearer Token (JWT)
- Pruebas interactivas de endpoints

### Autenticación y Autorización

El módulo de autenticación está completamente implementado con las siguientes características:

#### Guards
- **JwtAuthGuard**: Protege rutas autenticadas, respeta el decorador `@Public()`
- **RolesGuard**: Valida roles permitidos usando el decorador `@Roles()`

#### Decoradores
- **@Public()**: Marca una ruta como pública (no requiere autenticación)
- **@Roles(...roles)**: Define los roles permitidos para acceder a una ruta
- **@CurrentUser()**: Inyecta el usuario actual en los controladores

#### Estrategias
- **JwtStrategy**: Valida tokens JWT y verifica que el usuario esté activo
- **LocalStrategy**: Estrategia local para autenticación con email/password

#### Payload del JWT
El token JWT incluye la siguiente información:
```typescript
{
  sub: string,        // userId
  email: string,
  role: UserRole,     // SUPER_ADMIN | PROVIDER_ADMIN | OPERATOR | VIEWER
  providerId: string | null
}
```

#### Ejemplo de uso

```typescript
// Ruta pública
@Post('login')
@Public()
login(@Body() loginDto: LoginDto) { ... }

// Ruta protegida (requiere autenticación)
@Get('me')
@UseGuards(JwtAuthGuard)
getCurrentUser(@CurrentUser() user: any) { ... }

// Ruta protegida con roles específicos
@Post('register')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
register(@Body() registerDto: RegisterDto, @CurrentUser() user: any) { ... }
```

#### Uso en otros módulos

Para proteger rutas en otros módulos, importa los guards y decoradores:

```typescript
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@transporte-platform/database';

@Controller('providers')
export class ProvidersController {
  // Ruta pública
  @Get('public')
  @Public()
  getPublicData() { ... }

  // Ruta protegida (cualquier usuario autenticado)
  @Get('private')
  @UseGuards(JwtAuthGuard)
  getPrivateData(@CurrentUser() user: any) {
    // user contiene: id, email, role, providerId, provider
  }

  // Ruta solo para SUPER_ADMIN
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateProviderDto) { ... }

  // Ruta para múltiples roles
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateProviderDto) { ... }
}
```

### Estado de Implementación

- ✅ **Módulo de Autenticación**: Completamente implementado
  - Login, registro, refresh token, obtener usuario actual
  - Guards, decoradores y estrategias JWT/Local
  - Validación de roles y protección de rutas

- ✅ **Módulo de Vehículos**: Completamente implementado
  - CRUD completo con Prisma (findAll, findOne, create, update, delete)
  - Validación de existencia antes de operaciones
  - Error handling con NotFoundException
  - Ordenamiento por fecha de creación

- ✅ **Módulo de Servicios**: Completamente implementado
  - CRUD completo con Prisma
  - Incluye relaciones con provider y serviceType
  - Conversión automática de Decimal (basePrice) a número
  - Ordenamiento por fecha de creación

- ✅ **Módulo de Viajes**: Completamente implementado
  - CRUD completo con Prisma
  - Incluye relaciones con service y vehicle
  - Conversión automática de Decimal (pricePerSeat) a número
  - Ordenamiento por fecha de salida

- ✅ **Módulo de Reservas**: Completamente implementado
  - Búsqueda de viajes disponibles con filtros
  - Visualización de mapa de asientos con estados
  - Sistema de bloqueo de asientos (15 minutos)
  - Creación de reservas con validaciones completas
  - Confirmación y cancelación de reservas
  - Búsqueda por booking reference
  - Scheduler automático para liberar asientos bloqueados expirados
  - Transacciones de Prisma para operaciones críticas
  - Manejo de errores específicos (SeatNotAvailable, ReservationExpired, etc.)

- ✅ **Módulo de Pagos**: Completamente implementado
  - Integración con gateways DeUNA y Payphone
  - Creación de links de pago para reservas
  - Cálculo automático de comisiones (basado en provider.commissionRate)
  - Webhooks para recibir notificaciones de pago
  - Validación de firmas HMAC para webhooks
  - Confirmación automática de reservas al recibir pago exitoso
  - Sistema de reembolsos (solo SUPER_ADMIN o PROVIDER_ADMIN)
  - Modo mock para desarrollo (si no hay credenciales configuradas)
  - Manejo completo de estados de transacciones (PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED)

- ✅ **Módulo de Dashboard**: Completamente implementado
  - Endpoint `/api/dashboard/stats` para métricas en tiempo real
  - Endpoint `/api/dashboard/reservations-chart` para datos de gráficos
  - Cálculo de reservas del día, ingresos mensuales, ocupación promedio
  - Integrado con el dashboard administrativo de Next.js

- ⏳ **Otros módulos**: Estructura base completa (controllers, services, DTOs), pendientes de implementación:
  - **Providers**: CRUD pendiente (crear, actualizar, eliminar proveedores)
  - **Customers**: CRUD pendiente (gestión de clientes)

### Próximos Pasos de Desarrollo

1. ✅ ~~Implementar lógica de autenticación en `AuthService` (login, registro, JWT)~~ **COMPLETADO**
2. ✅ ~~Implementar guards de autorización por roles~~ **COMPLETADO**
3. ✅ ~~Implementar módulo de reservas completo (búsqueda, bloqueo, creación, confirmación, cancelación)~~ **COMPLETADO**
4. ✅ ~~Implementar integración con gateways de pago (DeUNA, Payphone)~~ **COMPLETADO**
5. ✅ ~~Implementar CRUD completo en módulos principales usando `PrismaService`~~ **COMPLETADO**
   - ✅ Vehicles: CRUD completo con validaciones
   - ✅ Services: CRUD completo con validaciones y relaciones
   - ✅ Trips: CRUD completo con validaciones y relaciones
   - ✅ Dashboard: Endpoints de métricas y analytics
   - ⏳ Providers: CRUD pendiente (crear, actualizar, eliminar)
   - ⏳ Customers: CRUD pendiente (gestión completa)
6. Agregar validaciones de negocio y reglas de autorización específicas por módulo
   - Validar que los usuarios solo puedan acceder a recursos de su provider (excepto SUPER_ADMIN)
   - Agregar validaciones de negocio específicas por módulo
7. Agregar filtrado, paginación y ordenamiento en endpoints de listado
   - Implementar query params para filtros (fecha, estado, provider, etc.)
   - Agregar paginación con limit/offset o cursor-based
   - Agregar ordenamiento por diferentes campos
8. Agregar tests unitarios y e2e
   - Tests unitarios para servicios críticos (reservations, payments)
   - Tests e2e para flujos completos (búsqueda → reserva → pago → confirmación)
9. Mejorar integración de pagos
   - Configurar webhooks en producción con las URLs correctas
   - Implementar reintentos para webhooks fallidos
   - Agregar logging y monitoreo de transacciones
   - Implementar notificaciones por email/SMS al confirmar reservas
10. Agregar funcionalidades adicionales
    - Sistema de notificaciones (email, SMS, push)
    - Dashboard de analytics y reportes
    - Exportación de datos (CSV, PDF)
    - Sistema de cupones y descuentos

## Base de Datos

### Estructura del Schema

El schema de Prisma (`packages/database/prisma/schema.prisma`) incluye los siguientes modelos:

#### Modelos principales
1. **Provider** - Empresas de transporte (multi-tenant)
   - RUC, nombre comercial, email, teléfono, tasa de comisión, estado, cuenta bancaria

2. **Vehicle** - Vehículos de cada proveedor
   - Placa, marca, modelo, año, total de asientos, layout de asientos (JSON), tipo, amenities (JSON)

3. **Seat** - Asientos individuales de cada vehículo
   - Número de asiento, fila, columna, posición (WINDOW/AISLE), tier (STANDARD/PREMIUM)

4. **ServiceType** - Tipos de servicio
   - interprovincial, tour_fijo, tour_personalizable

5. **Service** - Rutas/Tours de cada proveedor
   - Origen, destino, nombre, precio base, duración

6. **ScheduledTrip** - Viajes programados
   - Fecha y hora de salida, total de asientos, asientos disponibles, precio por asiento, modo de reserva, estado

7. **TripSeat** - Estado de cada asiento por viaje
   - Estado (AVAILABLE/LOCKED/RESERVED/CONFIRMED), bloqueado hasta

8. **Customer** - Clientes
   - Tipo y número de documento, nombre, apellido, email, teléfono

9. **Reservation** - Reservas
   - Referencia de reserva, tipo, número de pasajeros, subtotal, comisión, total, estado, canal

10. **Passenger** - Pasajeros de cada reserva
    - Documento, nombre, apellido, tipo de pasajero

11. **ReservationSeat** - Asientos asignados a reserva
    - Relación entre reserva, asiento del viaje y pasajero

12. **Transaction** - Pagos
    - Monto, comisión, monto del proveedor, gateway de pago, estado

13. **User** - Usuarios del dashboard
    - Email, hash de contraseña, rol, estado, proveedor asociado (nullable para admins)

### Variables de Entorno

El archivo `.env` en la raíz del proyecto es opcional pero útil para compartir `DATABASE_URL` entre Prisma y las aplicaciones. Puedes copiarlo del ejemplo:

```bash
# Linux/Mac
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

El archivo `.env.example` contiene:

```env
# Database
# This is used by Prisma and can be inherited by apps
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transporte_db?schema=public"

# Redis (optional)
REDIS_URL="redis://localhost:6379"
```

**Nota**: Para producción, actualiza `DATABASE_URL` con las credenciales de tu base de datos de producción en los archivos `.env` correspondientes.

### Comandos útiles de Prisma

```bash
# Desde packages/database

# Generar cliente después de cambios en el schema
pnpm prisma generate

# Crear nueva migración
pnpm prisma migrate dev --name nombre_migracion

# Ver estado de migraciones
pnpm prisma migrate status

# Abrir Prisma Studio (interfaz visual)
pnpm prisma studio

# Formatear el schema
pnpm prisma format

# Validar el schema
pnpm prisma validate
```

## Datos de Prueba (Seed)

El seed (`packages/database/prisma/seed.ts`) incluye datos realistas para Ecuador.

**Nota importante**: El seed requiere la dependencia `bcrypt` para hashear las contraseñas de los usuarios. Esta dependencia ya está incluida en `packages/database/package.json` y se instala automáticamente al ejecutar `pnpm install` desde la raíz del proyecto.

### Ejecutar el seed

```bash
# Desde packages/database
cd packages/database
pnpm seed

# O desde la raíz del proyecto
pnpm db:seed
```

### Datos incluidos:

### Providers (2)
- **Cotratudossa**
  - RUC: 0190123456001
  - Ubicación: Cuenca
  - Tipo: Transporte interprovincial
  - Comisión: 5%

- **Cuenca360**
  - RUC: 0190987654001
  - Ubicación: Cuenca
  - Tipo: Tours turísticos
  - Comisión: 5%

### Tipos de Servicio (3)
- `interprovincial` - Transporte entre provincias
- `tour_fijo` - Tours con ruta fija
- `tour_personalizable` - Tours personalizables (requiere cotización)

### Vehículos (4)
- **2 buses Cotratudossa** (40 asientos cada uno)
  - Placas: ABC-1234, ABC-5678
  - Layout: 2-2 (numeración 1A, 1B, 2A, 2B...)
- **1 bus doble piso Cuenca360** (50 asientos)
  - Placa: XYZ-9012
- **1 van Cuenca360** (15 asientos)
  - Placa: XYZ-3456

### Servicios (5)
- **Cuenca - Guayaquil**: $8.50, 4 horas
- **Cuenca - Quito**: $12.00, 8 horas
- **Cuenca - Machala**: $6.50, 3 horas
- **Tour Centro Histórico**: $15.00, 2 horas
- **Tour Cajas**: $35.00, 6 horas

### Viajes Programados (28)
Se generan viajes para los próximos 7 días desde la fecha de ejecución del seed:
- **Cuenca-Guayaquil**: 6:00 AM y 2:00 PM (14 viajes en 7 días)
- **Tour Centro Histórico**: 10:00 AM y 3:00 PM (14 viajes en 7 días)

Los asientos se generan automáticamente para cada viaje según el vehículo asignado.

**Nota**: Los viajes se crean a partir de la fecha actual (`new Date()`), por lo que si el seed se ejecutó hace varios días, es posible que necesites volver a ejecutarlo para tener viajes disponibles en fechas futuras.

### Usuarios (3)
- `admin@platform.com` - SUPER_ADMIN (sin provider)
- `admin@cotratudossa.com` - PROVIDER_ADMIN (Cotratudossa)
- `admin@cuenca360.com` - PROVIDER_ADMIN (Cuenca360)
- **Contraseña para todos**: `Test123!`

### Funciones Helper
- `generateBookingReference()` - Genera referencias de reserva únicas
  - Formato: 3 letras + 5 alfanuméricos (ej: CUE8X9Z2P)
  - Implementado en `apps/api/src/modules/reservations/utils/booking-reference.util.ts`
- `generateSeats()` - Genera asientos automáticamente según el layout 2-2 del vehículo

### Dependencias del Seed
- `bcrypt` - Para hashear contraseñas de usuarios (versión 5.1.1)
- `@types/bcrypt` - Tipos TypeScript para bcrypt (dev dependency)

## Frontend Web (apps/web)

La aplicación web pública está construida con Next.js 14 y proporciona la interfaz para que los usuarios busquen y reserven viajes.

### Stack Tecnológico

- **Next.js 14** con App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes UI
- **React Query** (@tanstack/react-query) para data fetching
- **Zustand** para estado global
- **React Hook Form** + **Zod** para formularios y validación
- **date-fns** para manejo de fechas
- **qrcode.react** para códigos QR

### Estructura

```
apps/web/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── layout.tsx          # Layout principal con Providers
│   │   ├── page.tsx            # Landing page
│   │   ├── buscar/             # Búsqueda de viajes
│   │   │   └── page.tsx
│   │   ├── reservar/           # Selección de asientos y checkout
│   │   │   └── [tripId]/
│   │   │       ├── page.tsx    # Selección de asientos
│   │   │       └── checkout/
│   │   │           └── page.tsx # Checkout con información de pasajeros
│   │   ├── confirmacion/        # Confirmación con QR
│   │   │   └── [reference]/
│   │   │       └── page.tsx
│   │   └── mis-reservas/       # Consultar reservas por referencia
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── form.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── popover.tsx
│   │   │   └── label.tsx
│   │   └── providers.tsx       # Providers (React Query)
│   ├── lib/
│   │   ├── api.ts              # Cliente API con métodos para reservas y pagos
│   │   ├── utils.ts            # Utilidades (formateo de moneda, fechas)
│   │   └── validations.ts      # Esquemas Zod para validación
│   ├── hooks/
│   │   └── use-toast.ts        # Hook para notificaciones toast
│   └── stores/
│       └── booking-store.ts    # Store Zustand para estado de reserva
├── public/                      # Archivos estáticos
├── tailwind.config.ts          # Configuración de Tailwind con colores personalizados
├── next.config.js              # Configuración de Next.js
├── components.json             # Configuración de shadcn/ui
└── package.json
```

### Configuración

La aplicación web requiere un archivo `.env.local` en `apps/web/`. Puedes copiar el archivo de ejemplo:

```bash
# Linux/Mac
cp apps/web/.env.example apps/web/.env.local

# Windows PowerShell
Copy-Item apps\web\.env.example apps\web\.env.local
```

El archivo `.env.example` contiene:

```env
# API URL for frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Asegúrate de que la URL coincida con el puerto en el que está corriendo la API (por defecto `3001`).

### Scripts

```bash
# Desarrollo
pnpm --filter @transporte-platform/web dev
# O desde apps/web:
pnpm dev

# Build
pnpm --filter @transporte-platform/web build

# Producción
pnpm --filter @transporte-platform/web start

# Linting
pnpm --filter @transporte-platform/web lint

# Type checking
pnpm --filter @transporte-platform/web type-check
```

### Páginas Disponibles

#### `/` - Landing Page
Página de inicio con:
- Hero section con CTA para buscar viajes
- Sección de características (múltiples destinos, horarios flexibles, pago seguro)
- CTA para consultar reservas existentes

#### `/buscar` - Búsqueda de Viajes
Formulario de búsqueda con:
- Origen y destino (inputs de texto)
- Fecha (calendario con validación de fechas futuras)
- Número de pasajeros (input numérico)
- Lista de viajes disponibles con:
  - Ruta (origen → destino)
  - Fecha y hora de salida
  - Asientos disponibles
  - Precio por asiento
  - Botón para seleccionar

#### `/reservar/[tripId]` - Selección de Asientos
Visualización interactiva del mapa de asientos:
- Grid de asientos con estados visuales:
  - Verde: Disponible
  - Azul: Seleccionado
  - Amarillo: Bloqueado
  - Rojo: Ocupado
- Leyenda de colores
- Contador de asientos seleccionados
- Botón para continuar al checkout

#### `/reservar/[tripId]/checkout` - Checkout
Formulario completo de información:
- **Información de contacto:**
  - Tipo y número de documento
  - Nombre y apellido
  - Email y teléfono
- **Información de pasajeros** (uno por asiento seleccionado):
  - Tipo y número de documento
  - Nombre y apellido
  - Tipo de pasajero (Adulto, Niño, Adulto mayor)
- Validación completa con Zod
- Botón para continuar al pago

#### `/confirmacion/[reference]` - Confirmación
Página de confirmación con:
- Mensaje de éxito
- Número de referencia de reserva
- Código QR con la referencia
- Detalles del viaje:
  - Ruta
  - Fecha y hora
  - Número de pasajeros
  - Total pagado
- Lista de pasajeros con información completa
- Botones para descargar comprobante y volver al inicio

#### `/mis-reservas` - Consultar Reservas
Búsqueda de reservas por número de referencia:
- Input para ingresar referencia
- Visualización de detalles de la reserva encontrada con badges de estado visuales (Pendiente, Confirmada, Cancelada, Reembolsada)
- Botón "Ver detalles completos" (redirige a `/confirmacion/[reference]`)
- Botón "Cancelar reserva" (solo visible si status es PENDING o CONFIRMED)
- Diálogo de confirmación con advertencia antes de cancelar
- Mensaje informativo para reservas ya canceladas
- Notificaciones toast para feedback de cancelación

### Componentes UI

La aplicación usa **shadcn/ui** con los siguientes componentes instalados:

- `button` - Botones con variantes (default, outline, ghost, etc.)
- `input` - Inputs de formulario
- `card` - Tarjetas con header, content, footer
- `dialog` - Modales
- `select` - Selectores desplegables
- `calendar` - Calendario para selección de fechas
- `form` - Formularios integrados con React Hook Form
- `toast` - Sistema de notificaciones
- `skeleton` - Estados de carga
- `popover` - Popovers
- `label` - Labels para formularios

### Estado Global (Zustand)

Se usa Zustand para manejar el estado de la reserva en curso:

```typescript
import { useBookingStore } from '@/stores/booking-store';

const {
  selectedTrip,      // ID del viaje seleccionado
  selectedSeats,     // Array de IDs de asientos seleccionados
  lockId,            // ID del bloqueo de asientos
  customer,          // Información del cliente
  passengers,        // Array de información de pasajeros
  reservationType,   // ONE_WAY | ROUND_TRIP
  setSelectedTrip,
  setSelectedSeats,
  setLockId,
  setCustomer,
  setPassengers,
  setReservationType,
  clear,             // Limpiar todo el estado
} = useBookingStore();
```

### API Client

El cliente API (`src/lib/api.ts`) proporciona métodos para:

#### Reservations API
- `searchTrips(params)` - Buscar viajes disponibles
- `getTripSeats(tripId)` - Obtener mapa de asientos de un viaje
- `lockSeats(data)` - Bloquear asientos temporalmente
- `createReservation(data)` - Crear reserva
- `getByReference(reference)` - Obtener reserva por referencia
- `confirm(id)` - Confirmar reserva
- `cancel(id)` - Cancelar reserva

#### Payments API
- `createPaymentLink(data)` - Crear link de pago
- `getByReservation(reservationId)` - Obtener estado de pago por reserva
- `getTransaction(id)` - Obtener transacción por ID

### Validación

Los esquemas de validación están en `src/lib/validations.ts` usando Zod:

- `searchTripsSchema` - Validación de búsqueda de viajes
- `customerSchema` - Validación de información del cliente
- `passengerSchema` - Validación de información de pasajeros
- `reservationSchema` - Validación de creación de reserva
- `bookingReferenceSchema` - Validación de búsqueda por referencia

### Estilos

- **Tailwind CSS** con configuración personalizada
- **Colores de transporte**: Paleta azul/verde profesional definida en `tailwind.config.ts`:
  - `transporte-blue-*` (50-900)
  - `transporte-green-*` (50-900)
- **Variables CSS** para temas (light/dark) en `globals.css`
- **Fuente**: Inter de Google Fonts

### Flujo de Reserva

1. **Búsqueda** (`/buscar`): Usuario busca viajes disponibles
2. **Selección de asientos** (`/reservar/[tripId]`): Usuario selecciona asientos
3. **Checkout** (`/reservar/[tripId]/checkout`): Usuario ingresa información
4. **Pago**: Redirección a gateway de pago (DeUNA o Payphone)
5. **Confirmación** (`/confirmacion/[reference]`): Usuario ve confirmación con QR

### Desarrollo

1. Asegúrate de que la API esté corriendo en `http://localhost:3001`
2. Crea el archivo `.env.local` en `apps/web/` con `NEXT_PUBLIC_API_URL`
3. Ejecuta `pnpm --filter @transporte-platform/web dev`
4. Abre `http://localhost:3000`

### Características Implementadas

- ✅ Landing page con diseño moderno
- ✅ Búsqueda de viajes con filtros (origen, destino, fecha, pasajeros)
- ✅ Calendario con selección de fechas y cierre automático
- ✅ Manejo correcto de timezones (UTC vs local)
- ✅ Visualización interactiva de mapa de asientos
- ✅ **Cálculo de precio en tiempo real** durante selección de asientos
- ✅ Validación inteligente de pasajeros: captura el número en la búsqueda, previene desajustes, ajusta automáticamente a asientos disponibles con notificación toast
- ✅ Sistema de bloqueo de asientos (15 minutos)
- ✅ Estado global de reserva con Zustand (número de pasajeros, asientos seleccionados, etc.)
- ✅ **Resumen de compra completo en checkout** con panel lateral sticky
- ✅ **Asignación visual de asientos a pasajeros** en formularios y resumen
- ✅ Formulario completo de checkout con validación
- ✅ Integración con gateways de pago
- ✅ Página de confirmación con código QR
- ✅ Consulta de reservas por referencia
- ✅ **Cancelación de reservas** con diálogo de confirmación y badges de estado (Pendiente, Confirmada, Cancelada, Reembolsada)
- ✅ Validación completa de formularios con React Hook Form + Zod
- ✅ Manejo de estados de carga con Skeleton components
- ✅ Notificaciones toast
- ✅ Diseño responsive
- ✅ TypeScript strict mode

### Próximos Pasos

- [ ] Agregar manejo de errores más robusto con mensajes específicos
- [ ] Implementar autenticación de usuarios (login/registro)
- [ ] Agregar tests (unitarios y e2e)
- [ ] Mejorar accesibilidad (ARIA labels, keyboard navigation)
- [ ] Optimizar imágenes y assets
- [ ] Agregar PWA support
- [ ] Implementar internacionalización (i18n)
- [ ] Agregar modo oscuro
- [ ] Implementar historial de reservas para usuarios autenticados

## Dashboard Administrativo (apps/dashboard)

El dashboard administrativo es una aplicación web construida con Next.js 14 que permite a los administradores y operadores gestionar toda la plataforma de transporte.

### Stack Tecnológico

- **Next.js 14** con App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes UI
- **Zustand** para estado global (autenticación)
- **React Hook Form** + **Zod** para formularios y validación
- **date-fns** para manejo de fechas
- **Recharts** para gráficos y visualización de datos
- **TanStack Table** (@tanstack/react-table) para tablas de datos
- **Axios** para comunicación con el API

### Estructura

```
apps/dashboard/
├── src/
│   ├── app/                          # App Router pages
│   │   ├── layout.tsx                # Layout raíz con Providers
│   │   ├── page.tsx                  # Redirect a /dashboard o /login
│   │   ├── login/
│   │   │   └── page.tsx              # Página de login con JWT
│   │   └── dashboard/
│   │       ├── layout.tsx            # Layout con sidebar y header
│   │       ├── page.tsx              # Dashboard home con métricas
│   │       ├── vehiculos/
│   │       │   └── page.tsx          # CRUD de vehículos
│   │       ├── servicios/
│   │       │   └── page.tsx          # CRUD de servicios/rutas
│   │       ├── viajes/
│   │       │   └── page.tsx          # CRUD de viajes con calendario
│   │       └── reservas/
│   │           └── page.tsx          # Gestión de reservas
│   ├── components/
│   │   ├── ui/                       # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── ...
│   │   ├── dashboard-nav.tsx         # Sidebar de navegación
│   │   ├── dashboard-header.tsx      # Header con perfil de usuario
│   │   └── auth-guard.tsx            # Guard para rutas protegidas
│   ├── lib/
│   │   ├── api.ts                    # Cliente API con axios
│   │   └── utils.ts                  # Utilidades (cn, formatters)
│   ├── stores/
│   │   └── auth-store.ts             # Store Zustand con persistencia
│   └── hooks/
│       └── use-toast.ts              # Hook para notificaciones
├── public/                            # Archivos estáticos
├── tailwind.config.ts                # Configuración Tailwind
├── next.config.js                    # Configuración Next.js
└── package.json
```

### Características

- ✅ **Autenticación JWT** completamente funcional
  - Login con email y contraseña
  - Protección de rutas con AuthGuard
  - Persistencia de sesión con Zustand persist
  - Interceptores Axios para tokens automáticos
  - Logout con limpieza de estado

- ✅ **Dashboard Home** con métricas y analytics
  - Tarjetas de métricas: Reservas Hoy, Ingresos del Mes, Ocupación Promedio, Próximos Viajes
  - Gráfico de barras (Recharts) mostrando reservas de últimos 7 días
  - Lista de reservas recientes con badges de estado
  - Lista de próximos viajes con indicadores de ocupación

- ✅ **Gestión de Vehículos** (`/dashboard/vehiculos`)
  - CRUD completo (Crear, Leer, Actualizar, Eliminar)
  - Búsqueda por placa, marca o modelo
  - Filtros por estado (Activo, Inactivo, Mantenimiento)
  - Modal de formulario con validación
  - Campos: placa, marca, modelo, año, capacidad, tipo, estado

- ✅ **Gestión de Servicios** (`/dashboard/servicios`)
  - CRUD completo para rutas de transporte
  - Búsqueda por nombre, origen o destino
  - Filtro por tipo (Directo, Con Paradas)
  - Gestión de precio base y duración
  - Estados visuales con badges

- ✅ **Gestión de Viajes** (`/dashboard/viajes`)
  - Doble vista: Calendario y Lista (con tabs)
  - Calendario interactivo para seleccionar fechas
  - Creación de viajes seleccionando servicio, vehículo, fecha, horarios y precio
  - Indicadores de ocupación con badges de colores
  - Estados: Programado, En Curso, Completado, Cancelado
  - Vista detallada por fecha seleccionada

- ✅ **Gestión de Reservas** (`/dashboard/reservas`)
  - Visualización de todas las reservas
  - Tarjetas de estadísticas: Total, Confirmadas, Pendientes, Ingresos
  - Búsqueda por referencia o nombre de pasajero
  - Filtro por estado (Confirmadas, Pendientes, Canceladas)
  - Acciones rápidas: Confirmar o Cancelar reservas
  - Badges de estado visuales

- ✅ **Componentes UI profesionales**
  - Sidebar de navegación con íconos
  - Header con dropdown de usuario
  - Tablas responsivas con acciones
  - Modales para CRUD
  - Sistema de notificaciones toast
  - Badges y estados visuales
  - Componentes de carga (skeletons)

### Configuración

El dashboard requiere un archivo `.env.local` en `apps/dashboard/`. Puedes crearlo basándote en el de la web:

```bash
# Linux/Mac
cp apps/web/.env.example apps/dashboard/.env.local

# Windows PowerShell
Copy-Item apps\web\.env.example apps\dashboard\.env.local
```

Contenido del archivo `.env.local`:

```env
# API URL for dashboard
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Scripts

```bash
# Desarrollo (puerto 3002)
pnpm --filter @transporte-platform/dashboard dev

# Build
pnpm --filter @transporte-platform/dashboard build

# Producción
pnpm --filter @transporte-platform/dashboard start

# Linting
pnpm --filter @transporte-platform/dashboard lint
```

### Acceso al Dashboard

1. **URL**: `http://localhost:3002`
2. **Credenciales de prueba** (configuradas en el seed):
   - **Super Admin**:
     - Email: `admin@platform.com`
     - Password: `Test123!`
   - **Provider Admin (Cotratudossa)**:
     - Email: `admin@cotratudossa.com`
     - Password: `Test123!`
   - **Provider Admin (Cuenca360)**:
     - Email: `admin@cuenca360.com`
     - Password: `Test123!`

### Páginas Disponibles

#### `/login` - Página de Login
- Formulario de autenticación con validación
- Mensajes de error claros
- Muestra credenciales de prueba
- Redirección automática al dashboard después del login

#### `/dashboard` - Dashboard Home
- Vista general con métricas clave
- Gráfico de reservas de últimos 7 días
- Reservas recientes (últimas 5)
- Próximos viajes programados
- Indicadores de tendencias

#### `/dashboard/vehiculos` - Gestión de Vehículos
- Tabla con todos los vehículos
- Búsqueda en tiempo real
- Crear nuevo vehículo (modal)
- Editar vehículo existente (modal)
- Eliminar vehículo (con confirmación)
- Columnas: Placa, Marca/Modelo, Año, Tipo, Capacidad, Estado

#### `/dashboard/servicios` - Gestión de Servicios
- Tabla con todas las rutas
- Búsqueda y filtros
- Crear nuevo servicio (modal)
- Editar servicio (modal)
- Eliminar servicio (con confirmación)
- Columnas: Nombre, Ruta (Origen → Destino), Precio Base, Duración, Tipo, Estado

#### `/dashboard/viajes` - Gestión de Viajes
- **Vista de Lista**: Tabla con todos los viajes filtrados por fecha
- **Vista de Calendario**: Calendario mensual con viajes del día seleccionado
- Crear nuevo viaje seleccionando servicio, vehículo, fecha y horarios
- Editar viaje existente
- Cancelar viaje
- Indicadores visuales de ocupación (Disponible, Buena ocupación, Casi lleno)
- Columnas: Fecha, Ruta, Horario, Vehículo, Precio, Ocupación, Estado

#### `/dashboard/reservas` - Gestión de Reservas
- Tarjetas con estadísticas (Total, Confirmadas, Pendientes, Ingresos)
- Tabla con todas las reservas
- Búsqueda por referencia o pasajero
- Filtro por estado
- Acciones: Confirmar reserva pendiente, Cancelar reserva
- Columnas: Referencia, Pasajero, Ruta, Fecha Viaje, Pasajeros, Total, Estado

### API Client

El cliente API (`src/lib/api.ts`) incluye métodos para:

#### Authentication
- `login(email, password)` - Autenticar usuario
- `setToken(token)` - Guardar token en localStorage
- `getToken()` - Obtener token guardado
- `clearToken()` - Eliminar token

#### Interceptores
- **Request interceptor**: Agrega automáticamente el token JWT a cada request
- **Response interceptor**: Maneja errores 401 (no autorizado) y redirige a login

#### Endpoints CRUD
- **Vehicles**: `getVehicles()`, `createVehicle()`, `updateVehicle()`, `deleteVehicle()`
- **Services**: `getServices()`, `createService()`, `updateService()`, `deleteService()`
- **Trips**: `getTrips()`, `createTrip()`, `updateTrip()`, `deleteTrip()`
- **Reservations**: `getReservations()`, `updateReservation()`
- **Dashboard**: `getDashboardStats()` - Obtiene métricas del dashboard

### Estado Global (Zustand)

El store de autenticación (`src/stores/auth-store.ts`) maneja:

```typescript
interface AuthState {
  user: User | null;         // Datos del usuario actual
  token: string | null;      // Token JWT
  isAuthenticated: boolean;  // Estado de autenticación
  setAuth: (user, token) => void;  // Guardar sesión
  clearAuth: () => void;     // Cerrar sesión
}
```

Con persistencia en localStorage usando Zustand persist middleware.

### Desarrollo

1. Asegúrate de que la API esté corriendo en `http://localhost:3001`
2. Crea el archivo `.env.local` con `NEXT_PUBLIC_API_URL`
3. Instala dependencias: `pnpm install`
4. Ejecuta el dashboard: `pnpm --filter @transporte-platform/dashboard dev`
5. Abre `http://localhost:3002` y usa las credenciales de prueba

### Integración con el Backend

El dashboard se comunica con el backend API (`http://localhost:3001/api`) usando:
- **JWT Authentication** para todas las peticiones
- **Axios interceptors** para manejo automático de tokens
- **Endpoints RESTful** para operaciones CRUD
- **Validación de roles** (SUPER_ADMIN, PROVIDER_ADMIN, OPERATOR, VIEWER)

### Próximos Pasos

- [ ] Agregar filtros avanzados en todas las páginas (fechas, rangos, múltiples criterios)
- [ ] Implementar paginación para tablas con muchos registros
- [ ] Agregar exportación de datos (CSV, Excel, PDF)
- [ ] Implementar dashboard de analytics con más gráficos (línea, pie, área)
- [ ] Agregar sistema de notificaciones en tiempo real
- [ ] Implementar reportes financieros y de ocupación
- [ ] Agregar gestión de usuarios y roles
- [ ] Implementar configuración de provider (datos, comisiones, cuenta bancaria)
- [ ] Agregar modo oscuro
- [ ] Implementar tests (unitarios y e2e)

## Tecnologías

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: NestJS 10
- **Frontend Web**: Next.js 14.2.35 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Dashboard Admin**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Recharts + TanStack Table
- **Database**: PostgreSQL 15 + Prisma ORM
- **Cache**: Redis 7
- **TypeScript**: Strict mode (frontends), configurado para compatibilidad en backend
- **Autenticación**: JWT (Passport.js) + bcrypt para hashing de passwords
- **Validación**: class-validator + class-transformer (backend), Zod (frontends)
- **Documentación API**: Swagger/OpenAPI
- **Scheduling**: @nestjs/schedule para tareas programadas (liberación de asientos bloqueados)
- **State Management**: Zustand (frontends)
- **Data Fetching**: React Query / TanStack Query (web), Axios (dashboard)
- **Data Visualization**: Recharts (dashboard)
- **HTTP Client**: Axios con interceptores (dashboard)

## Solución de Problemas (Troubleshooting)

### Error: "net::ERR_CONNECTION_REFUSED" al intentar conectar al backend

**Síntoma**: El frontend muestra error de conexión al intentar hacer requests a `http://localhost:3001`

**Causa**: El servidor de backend no está corriendo o no se compiló correctamente.

**Solución**:
```bash
# 1. Asegúrate de haber construido todos los packages
pnpm build

# 2. Inicia el servidor de backend
pnpm --filter @transporte-platform/api start

# 3. Verifica que el servidor esté corriendo
curl http://localhost:3001/api/reservations/trips/search?origin=Cuenca&destination=Guayaquil&date=2025-12-12&passengers=1
```

### Error: "SyntaxError: Unexpected token 'export'" al iniciar el API

**Síntoma**: El servidor de backend falla al iniciar con error sobre `export` en el archivo de database

**Causa**: El package `@transporte-platform/database` no está exportando correctamente los módulos en formato CommonJS.

**Solución**: Este error ya fue corregido en el proyecto. El archivo `packages/database/src/index.js` exporta correctamente los tipos de Prisma. Si vuelve a ocurrir:

1. Verifica que `packages/database/package.json` tenga:
   ```json
   {
     "main": "./src/index.js",
     "exports": {
       ".": {
         "require": "./src/index.js"
       }
     }
   }
   ```

2. Asegúrate de que exista `packages/database/src/index.js` con exports CommonJS

### Error de TypeScript: "TS2742: The inferred type cannot be named"

**Síntoma**: Errores de compilación TypeScript relacionados con tipos de Prisma

**Causa**: Configuración TypeScript muy estricta incompatible con el monorepo de NestJS + Prisma

**Solución**: Este error ya fue corregido. El archivo `apps/api/tsconfig.json` está configurado con:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": false,
    "declaration": false
  }
}
```

### Backend no se compila correctamente con `nest start --watch`

**Síntoma**: El modo watch de NestJS falla o no recoge cambios correctamente

**Causa**: Problemas de compatibilidad con el entorno de monorepo y las rutas de módulos compartidos

**Solución**: Usar el modo producción para mayor estabilidad:
```bash
# 1. Compilar el proyecto
pnpm --filter @transporte-platform/api build

# 2. Ejecutar en modo producción
pnpm --filter @transporte-platform/api start
```

### Frontend no puede conectarse al backend después de cambios

**Síntoma**: Después de hacer cambios en el código, el frontend no puede conectarse al backend

**Solución**:
```bash
# 1. Reconstruir todos los packages
pnpm build

# 2. Reiniciar el backend
# Detén el proceso actual (Ctrl+C) y vuelve a iniciar
pnpm --filter @transporte-platform/api start

# 3. Verifica las variables de entorno
# En apps/web/.env.local debe estar:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Base de datos no tiene tablas o da errores de schema

**Síntoma**: Errores de Prisma sobre tablas faltantes o schema incorrecto

**Solución**:
```bash
# 1. Asegúrate de que Docker esté corriendo
docker ps

# 2. Regenera el cliente de Prisma
pnpm --filter @transporte-platform/database generate

# 3. Ejecuta las migraciones
pnpm --filter @transporte-platform/database migrate

# 4. (Opcional) Resetea la base de datos completamente
pnpm --filter @transporte-platform/database migrate:reset
pnpm db:seed
```

### Cambios en el package `database` no se reflejan en el API

**Síntoma**: Modificaciones en el schema de Prisma o en exports no son visibles en el API

**Solución**:
```bash
# 1. Regenera el cliente de Prisma
pnpm --filter @transporte-platform/database generate

# 2. Reconstruye TODO el proyecto
pnpm build

# 3. Reinicia el servidor
pnpm --filter @transporte-platform/api start
```

### Error: "trip.pricePerSeat.toFixed is not a function" en el frontend

**Síntoma**: El frontend muestra errores al intentar usar `.toFixed()` en campos numéricos del backend

**Causa**: Prisma Decimal types no se están convirtiendo a números JavaScript antes de enviarlos al frontend

**Solución**: Este error ya fue corregido en el proyecto. Todos los campos Decimal de Prisma (pricePerSeat, subtotal, commission, total, amount, etc.) son convertidos automáticamente a números usando `.toNumber()` en los servicios del backend antes de ser retornados en las respuestas de la API.

**Áreas donde se aplicó la corrección**:
- `apps/api/src/modules/reservations/reservations.service.ts`:
  - Línea 84: `pricePerSeat` en `searchTrips()`
  - Líneas 479-481: `total`, `subtotal`, `commission` en `create()`
  - Líneas 658-660, 700: Campos financieros en `findByReference()`
- `apps/api/src/modules/payments/payments.service.ts`:
  - Líneas 142, 146-148: Campos financieros en `getPaymentByReservationId()`

**Nota importante**: Si modificas el schema de Prisma para agregar nuevos campos de tipo `Decimal`, recuerda siempre convertirlos a número con `.toNumber()` antes de retornarlos en la API.

### Error: El calendario selecciona el día anterior o muestra viajes del día anterior

**Síntoma**: Al seleccionar una fecha (ej: 15 de diciembre), se selecciona o muestra el día anterior (14 de diciembre)

**Causa**: Problema de timezone. JavaScript interpreta strings de fecha como `"2025-12-15"` como UTC medianoche, lo que en timezones detrás de UTC (como Ecuador UTC-5) resulta en el día anterior.

**Solución**: Este error ya fue corregido en el proyecto:

**Backend** (`apps/api/src/modules/reservations/reservations.service.ts`, líneas 37-42):
```typescript
// ❌ INCORRECTO - Interpreta como UTC
const searchDate = new Date(date);

// ✅ CORRECTO - Interpreta en timezone local
const [year, month, day] = date.split('-').map(Number);
const searchDate = new Date(year, month - 1, day);
```

**Frontend** (`apps/web/src/app/buscar/page.tsx`):
- Usa `parseISO()` de `date-fns` en lugar de `new Date()` para parsear fechas ISO
- Usa `startOfDay()` para comparar fechas sin componente de hora
- Combina `departureDate` y `departureTime` correctamente para mostrar fechas completas

**Calendario** (`apps/web/src/app/buscar/page.tsx`, líneas 130, 136):
- Popover controlado con estado `calendarOpen`
- Se cierra automáticamente al seleccionar fecha con `setCalendarOpen(false)`

### Verificar que todos los servicios estén corriendo correctamente

```bash
# Verificar Docker
docker ps
# Deberías ver: transporte-postgres (puerto 5432) y transporte-redis (puerto 6379)

# Verificar Backend API
curl http://localhost:3001/api/reservations/trips/search?origin=Cuenca&destination=Guayaquil&date=2025-12-12&passengers=1
# Deberías recibir JSON con datos de viajes

# Verificar Frontend
# Abre http://localhost:3000 en el navegador
```

## Notas Importantes sobre el Monorepo

1. **Siempre ejecuta `pnpm build` después de**:
   - Instalar dependencias nuevas
   - Hacer cambios en `packages/database`
   - Hacer cambios en `packages/shared`
   - Hacer cambios en `packages/ui`
   - Clonar el repositorio por primera vez

2. **Reinicia el API server después de cambios en el código**:
   - El modo watch de NestJS (`pnpm dev`) puede no detectar todos los cambios
   - Si haces cambios importantes en servicios o módulos, detén el servidor (Ctrl+C) y reinícialo
   - En Windows, si el puerto sigue ocupado, usa: `taskkill //F //PID <process_id>`
   - Verifica el PID del proceso con: `netstat -ano | findstr :3001`

3. **El package `database` exporta módulos en CommonJS**: Para compatibilidad con NestJS, el archivo `packages/database/src/index.js` exporta en formato CommonJS. El archivo `.ts` correspondiente solo se usa para tipos TypeScript.

4. **TypeScript en el API está configurado para compatibilidad**: La configuración `apps/api/tsconfig.json` tiene `strict: false` para evitar conflictos con tipos de Prisma en el monorepo. Esto no afecta la seguridad de tipos en desarrollo.

5. **Usa `pnpm start` en lugar de `pnpm dev` para el API**: El modo `dev` con watch puede ser inestable. El modo producción (`start`) es más confiable para desarrollo local.

6. **Conversión de tipos Decimal**: Todos los campos `Decimal` de Prisma deben convertirse a números con `.toNumber()` antes de retornarlos en la API. Ver la sección "Buenas Prácticas de Desarrollo" para más detalles.

