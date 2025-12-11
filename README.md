# Transporte Platform

Monorepo para plataforma de transporte usando pnpm workspaces y Turborepo.

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

# 2. Crear archivo .env (si no existe)
# El archivo .env debe contener:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transporte_db?schema=public"
# REDIS_URL="redis://localhost:6379"

# 3. Iniciar servicios Docker (PostgreSQL y Redis)
docker-compose -f docker/docker-compose.yml up -d

# 4. Configurar base de datos (desde packages/database)
cd packages/database
pnpm prisma generate
pnpm prisma migrate dev --name init

# 5. Seed de base de datos (opcional)
# Nota: El seed requiere bcrypt para hashear contraseñas (ya incluido en package.json)
# Si instalaste dependencias desde la raíz, bcrypt ya está instalado
pnpm seed
# O desde la raíz del proyecto:
# pnpm db:seed
```

### Configuración inicial de la base de datos

Si es la primera vez que configuras el proyecto:

```bash
# Desde la raíz del proyecto
docker-compose -f docker/docker-compose.yml up -d

# Desde packages/database
cd packages/database
pnpm prisma generate          # Genera el cliente de Prisma
pnpm prisma migrate dev --name init  # Crea y aplica la migración inicial
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

Cada app y package puede ejecutarse individualmente:

```bash
# Ejecutar solo la API
pnpm --filter @transporte-platform/api dev

# Ejecutar solo la web
pnpm --filter @transporte-platform/web dev

# Ejecutar solo el dashboard
pnpm --filter @transporte-platform/dashboard dev
```

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

### Configuración

La API requiere un archivo `.env` en `apps/api/` con las siguientes variables:

```env
# Server
PORT=3001

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transporte_db?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="*"

# Payment Gateways (opcional para MVP - si no se configuran, funcionan en modo mock)
DEUNA_API_KEY=your-deuna-api-key
DEUNA_WEBHOOK_SECRET=your-deuna-webhook-secret
DEUNA_BASE_URL=https://api.deuna.com

PAYPHONE_TOKEN=your-payphone-token
PAYPHONE_STORE_ID=your-payphone-store-id
PAYPHONE_WEBHOOK_SECRET=your-payphone-webhook-secret
PAYPHONE_BASE_URL=https://pay.payphonetodoesposible.com

# App URL (para callbacks de pago)
APP_URL=http://localhost:3000
```

**Nota**: El archivo `.env` de la API puede heredar `DATABASE_URL` del `.env` de la raíz del proyecto.

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

#### 3. Vehicles (`/api/vehicles`)
- `GET /api/vehicles` - Listar todos los vehículos
- `GET /api/vehicles/:id` - Obtener vehículo por ID
- `POST /api/vehicles` - Crear vehículo
- `PUT /api/vehicles/:id` - Actualizar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo

#### 4. Services (`/api/services`)
- `GET /api/services` - Listar todos los servicios/rutas
- `GET /api/services/:id` - Obtener servicio por ID
- `POST /api/services` - Crear servicio
- `PUT /api/services/:id` - Actualizar servicio
- `DELETE /api/services/:id` - Eliminar servicio

#### 5. Trips (`/api/trips`)
- `GET /api/trips` - Listar todos los viajes programados
- `GET /api/trips/:id` - Obtener viaje por ID
- `POST /api/trips` - Crear viaje programado
- `PUT /api/trips/:id` - Actualizar viaje
- `DELETE /api/trips/:id` - Eliminar viaje

#### 6. Reservations (`/api/reservations`) ✅ **COMPLETAMENTE IMPLEMENTADO**
- `GET /api/reservations/trips/search` - Buscar viajes disponibles
  - Query params: `origin`, `destination`, `date` (YYYY-MM-DD), `passengers`
  - Retorna viajes con asientos disponibles >= passengers
  - Incluye precio, horario, vehículo, amenities
- `GET /api/reservations/trips/:tripId/seats` - Obtener mapa de asientos de un viaje
  - Retorna estado de cada asiento (available/locked/confirmed/reserved/blocked)
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
  
- ⏳ **Otros módulos**: Estructura base completa (controllers, services, DTOs), pero la lógica de negocio está marcada con `TODO` y debe ser implementada. Cada servicio tiene métodos placeholder que deben ser completados usando `PrismaService`.

### Próximos Pasos de Desarrollo

1. ✅ ~~Implementar lógica de autenticación en `AuthService` (login, registro, JWT)~~ **COMPLETADO**
2. ✅ ~~Implementar guards de autorización por roles~~ **COMPLETADO**
3. ✅ ~~Implementar módulo de reservas completo (búsqueda, bloqueo, creación, confirmación, cancelación)~~ **COMPLETADO**
4. ✅ ~~Implementar integración con gateways de pago (DeUNA, Payphone)~~ **COMPLETADO**
5. Implementar CRUD completo en otros módulos usando `PrismaService`
   - Providers: CRUD completo con validaciones
   - Vehicles: CRUD completo con validaciones
   - Services: CRUD completo con validaciones
   - Trips: CRUD completo con validaciones
   - Customers: CRUD completo con validaciones
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

El archivo `.env` en la raíz del proyecto debe contener:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transporte_db?schema=public"

# Redis (opcional)
REDIS_URL="redis://localhost:6379"
```

**Nota**: Para producción, actualiza `DATABASE_URL` con las credenciales de tu base de datos de producción.

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

### Viajes Programados (15)
Se generan viajes para los próximos días:
- **Cuenca-Guayaquil**: 6:00 AM y 2:00 PM (8 viajes en 4 días)
- **Tour Centro Histórico**: 10:00 AM y 3:00 PM (7 viajes en 4 días)

Los asientos se generan automáticamente para cada viaje según el vehículo asignado.

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

La aplicación web requiere un archivo `.env.local` en `apps/web/` con:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

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
- Visualización de detalles de la reserva encontrada
- Botón para ver detalles completos (redirige a `/confirmacion/[reference]`)

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
- ✅ Búsqueda de viajes con filtros
- ✅ Visualización interactiva de mapa de asientos
- ✅ Sistema de bloqueo de asientos (15 minutos)
- ✅ Formulario completo de checkout
- ✅ Integración con gateways de pago
- ✅ Página de confirmación con código QR
- ✅ Consulta de reservas por referencia
- ✅ Validación completa de formularios
- ✅ Manejo de estados de carga
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

## Tecnologías

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: NestJS 10
- **Frontend Web**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL 15 + Prisma ORM
- **Cache**: Redis 7
- **TypeScript**: Strict mode
- **Autenticación**: JWT (Passport.js) + bcrypt para hashing de passwords
- **Validación**: class-validator + class-transformer (backend), Zod (frontend)
- **Documentación API**: Swagger/OpenAPI
- **Scheduling**: @nestjs/schedule para tareas programadas (liberación de asientos bloqueados)
- **State Management**: Zustand (frontend)
- **Data Fetching**: React Query / TanStack Query (frontend)

