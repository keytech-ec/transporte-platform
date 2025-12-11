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
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar servicios (PostgreSQL y Redis)
docker-compose -f docker/docker-compose.yml up -d

# Ejecutar migraciones
pnpm db:migrate

# Seed de base de datos (opcional)
pnpm db:seed
```

## Scripts

- `pnpm dev` - Inicia todos los servicios en modo desarrollo
- `pnpm build` - Construye todos los packages y apps
- `pnpm lint` - Ejecuta linters en todos los packages
- `pnpm test` - Ejecuta tests en todos los packages
- `pnpm db:migrate` - Ejecuta migraciones de Prisma
- `pnpm db:seed` - Ejecuta seed de base de datos
- `pnpm db:studio` - Abre Prisma Studio

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

## Tecnologías

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: NestJS 10
- **Frontend**: Next.js 14 (App Router)
- **Database**: PostgreSQL 15 + Prisma
- **Cache**: Redis 7
- **TypeScript**: Strict mode

