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
pnpm prisma db seed
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

El seed (`packages/database/prisma/seed.ts`) incluye datos realistas para Ecuador:

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
- `generateBookingReference()` - Genera referencias de reserva únicas (8 caracteres alfanuméricos)
- `generateSeats()` - Genera asientos automáticamente según el layout 2-2 del vehículo

## Tecnologías

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: NestJS 10
- **Frontend**: Next.js 14 (App Router)
- **Database**: PostgreSQL 15 + Prisma ORM
- **Cache**: Redis 7
- **TypeScript**: Strict mode

