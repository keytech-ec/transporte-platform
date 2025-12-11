# Transporte Platform API

API backend construida con NestJS 10 para la plataforma de transporte multi-tenant.

## Estructura

```
apps/api/
├── src/
│   ├── main.ts                 # Bootstrap de la aplicación
│   ├── app.module.ts           # Módulo principal
│   ├── common/                 # Utilidades comunes
│   │   ├── decorators/        # Decoradores personalizados
│   │   ├── filters/           # Filtros de excepciones
│   │   ├── guards/            # Guards de autenticación/autorización
│   │   ├── interceptors/      # Interceptores de respuesta
│   │   └── pipes/             # Pipes de validación
│   ├── config/                # Configuración
│   │   └── configuration.ts   # Configuración de variables de entorno
│   ├── modules/               # Módulos de negocio
│   │   ├── auth/              # Autenticación (JWT)
│   │   ├── providers/         # CRUD proveedores
│   │   ├── vehicles/          # CRUD vehículos
│   │   ├── services/          # CRUD servicios/rutas
│   │   ├── trips/             # CRUD viajes programados
│   │   ├── reservations/     # Reservas (crear, confirmar, cancelar)
│   │   ├── payments/          # Integración con gateways de pago
│   │   └── customers/         # CRUD clientes
│   └── prisma/                # Servicio de Prisma
│       ├── prisma.service.ts
│       └── prisma.module.ts
├── test/                      # Tests
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env                       # Variables de entorno (no versionado)
```

## Características

- ✅ NestJS 10 con TypeScript
- ✅ Prisma ORM integrado con `@transporte-platform/database`
- ✅ ConfigModule con validación de variables de entorno
- ✅ Global exception filter
- ✅ Response interceptor para formato consistente
- ✅ ValidationPipe global con class-validator
- ✅ Swagger/OpenAPI configurado en `/api/docs`
- ✅ CORS habilitado
- ✅ Helmet para seguridad
- ✅ JWT authentication strategy
- ✅ 8 módulos base con estructura completa (controller, service, DTOs)

## Instalación

```bash
# Desde la raíz del proyecto
pnpm install

# O solo para la API
pnpm --filter @transporte-platform/api install
```

## Configuración

Crea un archivo `.env` en `apps/api/` con las siguientes variables:

```env
# Server
PORT=3001

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transporte_db?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="1d"

# CORS
CORS_ORIGIN="*"
```

## Ejecución

```bash
# Desarrollo (watch mode)
pnpm --filter @transporte-platform/api dev

# O desde la raíz
pnpm dev
```

## Endpoints

- **API Base**: `http://localhost:3001/api`
- **Swagger Docs**: `http://localhost:3001/api/docs`

### Módulos disponibles:

- `/api/auth` - Autenticación (login, registro)
- `/api/providers` - Gestión de proveedores
- `/api/vehicles` - Gestión de vehículos
- `/api/services` - Gestión de servicios/rutas
- `/api/trips` - Gestión de viajes programados
- `/api/reservations` - Gestión de reservas
- `/api/payments` - Procesamiento de pagos
- `/api/customers` - Gestión de clientes

## Desarrollo

Los módulos están creados con estructura base (controller, service, DTOs) pero sin lógica de negocio implementada. Cada servicio tiene métodos TODO que deben ser implementados.

### Próximos pasos:

1. Implementar lógica de autenticación en `AuthService`
2. Implementar CRUD completo en cada módulo usando PrismaService
3. Agregar validaciones de negocio
4. Implementar guards de autorización por roles
5. Agregar tests unitarios y e2e

