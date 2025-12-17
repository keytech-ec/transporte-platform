# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo for a transportation platform** built with pnpm workspaces and Turborepo. The platform consists of:
- **API Backend** (NestJS 10 + Prisma) - REST API with JWT authentication
- **Public Web App** (Next.js 14) - Customer-facing booking interface
- **Admin Dashboard** (Next.js 14) - Administrative management interface
- **Shared Packages** - Database schema, shared types, and UI components

## Development Principles

**CRITICAL: Follow these guidelines for ALL code changes:**

### 1. Incremental Implementation & Testing
- **Do each implementation step by step**
- **Test thoroughly and verify functionality before moving to the next step**
- Never implement multiple features simultaneously without testing each one
- If something breaks, identify and fix it immediately before proceeding

### 2. Impact Analysis & Cross-file Updates
- **Check if new changes impact other files and update them too**
- Search for all usages of modified functions, types, or components
- Update imports, type definitions, and dependent code across the entire codebase
- Example: If you modify an API endpoint, update:
  - Frontend API calls
  - Type definitions in `packages/shared`
  - Related tests
  - Documentation

### 3. Consistency, Simplicity & Structure
- **Keep consistency across the codebase**
- **Reuse existing components, patterns, and utilities**
- **Minimize impact** - prefer modifying existing code over creating new files
- Follow established patterns:
  - NestJS modules follow the same structure (controller → service → repository)
  - Frontend components use shadcn/ui and Tailwind CSS
  - API responses use consistent DTOs
  - Error handling follows established patterns
- Before creating a new component or utility, check if a similar one exists

### 4. Documentation Updates
- **Check and update documentation after making changes**
- Update relevant README files when modifying:
  - Database schema → `packages/database/README.md`
  - API endpoints → Update Swagger decorators and module docs
  - New features → Update `CLAUDE.md` if architectural changes occur
  - Environment variables → Update `.env.example` and documentation
- Keep inline code comments up-to-date with logic changes

### 5. Database-Driven & Dynamic Elements
- **Use dynamic elements loaded from the database when possible**
- **Centralize data to avoid hardcoding** (cities, filters, categories, etc.)
- Examples of what should be DB-driven:
  - Cities/locations → Load from `Service.origin` and `Service.destination`
  - Vehicle types → Load from `VehicleType` enum (already in DB schema)
  - Service types → Load from `ServiceType` table
  - Filters and dropdowns → Derive from existing data

**Performance considerations:**
- If DB queries would significantly impact performance, use hardcoded values or caching
- When hardcoding is necessary, **document it clearly** in:
  - The relevant README file
  - Code comments explaining why it's hardcoded
  - A note about what needs updating when data changes

**Example:**
```typescript
// ❌ BAD - Hardcoded without documentation
const cities = ['Cuenca', 'Guayaquil', 'Quito'];

// ✅ GOOD - Dynamic from database
const cities = await prisma.service.findMany({
  select: { origin: true, destination: true },
  distinct: ['origin', 'destination']
});

// ✅ ACCEPTABLE - Hardcoded with clear documentation
// NOTE: Update this list when adding new provinces
// See: packages/database/README.md for updating locations
const ecuadorProvinces = ['Azuay', 'Guayas', 'Pichincha']; // Static for performance
```

## Essential Commands

### Development Workflow

```bash
# First-time setup
pnpm install
pnpm build  # ALWAYS build before running services
docker-compose -f docker/docker-compose.yml up -d  # Start PostgreSQL + Redis
pnpm --filter @transporte-platform/database generate
pnpm --filter @transporte-platform/database migrate
pnpm db:seed  # Optional: populate with test data

# Start all services (recommended)
pnpm dev

# Start individual services (requires prior pnpm build)
pnpm --filter @transporte-platform/api start     # Backend API (production mode, more stable)
pnpm --filter @transporte-platform/web dev       # Public web (port 3000)
pnpm --filter @transporte-platform/dashboard dev # Admin dashboard (port 3002)
```

### Database Operations

```bash
# From root
pnpm db:migrate  # Apply migrations
pnpm db:seed     # Seed database with test data
pnpm db:studio   # Open Prisma Studio GUI

# From packages/database
pnpm migrate           # Create and apply new migration
pnpm migrate:reset     # Reset database completely
pnpm generate          # Regenerate Prisma client
```

### Building and Testing

```bash
pnpm build       # Build all packages and apps (required after dependency changes)
pnpm lint        # Lint all packages
pnpm test        # Run tests
pnpm type-check  # TypeScript type checking

# Build specific package/app
pnpm --filter @transporte-platform/api build
pnpm --filter @transporte-platform/web build
```

## Architecture

### Monorepo Structure

```
transporte-platform/
├── apps/
│   ├── api/           # NestJS backend (port 3001)
│   ├── web/           # Next.js public frontend (port 3000)
│   └── dashboard/     # Next.js admin dashboard (port 3002)
├── packages/
│   ├── database/      # Prisma schema + seed
│   ├── shared/        # Shared TypeScript types
│   └── ui/            # Shared React components (shadcn/ui)
└── docker/            # Docker Compose config
```

### Backend API (NestJS)

**Port:** 3001 | **Swagger:** http://localhost:3001/api/docs

#### Module Structure
All business logic is organized into NestJS modules under `apps/api/src/modules/`:
- `auth/` - JWT authentication, guards, strategies, decorators (@Public, @Roles, @CurrentUser)
- `providers/` - Transport company management
- `vehicles/` - Vehicle CRUD with Prisma
- `services/` - Routes/services CRUD
- `trips/` - Scheduled trip CRUD
- `reservations/` - Complete booking flow (search, seat locking, creation, confirmation, cancellation)
- `payments/` - DeUNA/Payphone integration, webhooks, refunds
- `customers/` - Customer management
- `dashboard/` - Analytics endpoints for admin dashboard

#### Authentication System
- **Guards:** `JwtAuthGuard` (global), `RolesGuard` (role-based access)
- **Decorators:** `@Public()` (exempt from auth), `@Roles(...roles)` (restrict by role), `@CurrentUser()` (inject user)
- **Strategies:** `JwtStrategy` (validates tokens), `LocalStrategy` (email/password)
- **Roles:** SUPER_ADMIN, PROVIDER_ADMIN, OPERATOR, VIEWER

#### Critical: Prisma Decimal Conversion
**All Prisma Decimal fields MUST be converted to numbers before returning from API:**

```typescript
// ❌ WRONG - Returns Prisma Decimal object
return { pricePerSeat: trip.pricePerSeat }

// ✅ CORRECT - Converts to JavaScript number
return { pricePerSeat: trip.pricePerSeat.toNumber() }
```

**Fields requiring conversion:**
- Prices: `pricePerSeat`, `basePrice`
- Financial: `subtotal`, `commission`, `total`, `amount`, `providerAmount`, `commissionRate`

Apply conversion in service methods before returning to controllers. See `apps/api/src/modules/reservations/reservations.service.ts` and `apps/api/src/modules/payments/payments.service.ts` for examples.

#### API Stability Notes
- **Prefer production mode:** Use `pnpm --filter @transporte-platform/api start` instead of `dev` mode
- The `dev` mode with `--watch` can be unstable in monorepo environments
- Always run `pnpm build` before starting the API in production mode

### Frontend Web (Next.js 14)

**Port:** 3000 | **Stack:** App Router, TypeScript, Tailwind CSS, shadcn/ui, React Query, Zustand

#### Key Features
- **Booking flow:** Search trips → Select seats → Checkout → Payment → Confirmation with QR code
- **Real-time seat selection:** Visual seat map with state indicators (available/locked/occupied)
- **15-minute seat lock:** Temporary seat reservation during checkout
- **Smart passenger validation:** Captures passenger count in search, prevents mismatches
- **Timezone handling:** Proper UTC vs local time conversion for dates
- **Zustand store:** Global booking state (`useBookingStore`)
- **React Query:** Data fetching with caching
- **Form validation:** React Hook Form + Zod schemas

#### Important Pages
- `/` - Landing page with search form
- `/buscar` - Search results with filters (time, price, vehicle type)
- `/reservar/[tripId]` - Seat selection with live price calculation
- `/reservar/[tripId]/checkout` - Customer + passenger info forms
- `/confirmacion/[reference]` - Booking confirmation with QR code
- `/mis-reservas` - Look up existing reservations by reference

### Admin Dashboard (Next.js 14)

**Port:** 3002 | **Stack:** App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Table, Axios, Zustand

#### Key Features
- **JWT authentication:** Login, session persistence, auto-redirect
- **Dashboard home:** Metrics cards, reservations chart (Recharts), recent activity
- **CRUD pages:** Vehicles, Services/Routes, Trips, Reservations
- **Dual-view trips:** Calendar view + list view with tabs
- **Axios interceptors:** Auto-inject JWT tokens, handle 401 errors
- **Zustand auth store:** Persistent authentication state

#### Test Credentials (from seed)
```
Super Admin: admin@platform.com / Test123!
Provider Admin: admin@cotratudossa.com / Test123!
Provider Admin: admin@cuenca360.com / Test123!
```

### Database (Prisma + PostgreSQL)

**Location:** `packages/database/prisma/schema.prisma`
**Documentation:** See `packages/database/README.md` for comprehensive schema reference

#### Entity Relationship Overview

```
Provider (Transport Company)
├── Vehicles → Seats → TripSeats (per trip availability)
├── Services (Routes) → ScheduledTrips
│   └── Reservations
│       ├── ReservationSeats (seat assignments)
│       ├── Passengers (traveler info)
│       └── Transactions (payments)
└── Users (operators/admins)
    ├── soldReservations (sales tracking)
    └── receivedTransactions (POS payments)

Customer → Reservations
```

#### Core Models (13 total)

**Multi-tenancy:**
1. **Provider** - Transport companies with commission rates
2. **User** - Dashboard users (admins, operators, viewers) with role-based access

**Inventory:**
3. **Vehicle** - Buses/vans with seat layouts (JSON), amenities
4. **Seat** - Individual physical seats (position, tier, row/column)
5. **ServiceType** - Service categories (Interprovincial, Tourism, etc.)
6. **Service** - Routes/tours (origin → destination, base pricing)

**Scheduling:**
7. **ScheduledTrip** - Specific trip instances (date, time, vehicle, pricing, status)
8. **TripSeat** - Per-trip seat availability with 15-min locking mechanism

**Bookings:**
9. **Customer** - Passenger contact information (unique by document)
10. **Reservation** - Booking records with reference codes, channel tracking
11. **Passenger** - Individual travelers with document details, passenger type
12. **ReservationSeat** - Links passengers to specific seats

**Payments:**
13. **Transaction** - Payment records (gateway, method, commission split, status)

#### Critical Features

**Seat Locking Flow:**
```
AVAILABLE → LOCKED (15 min) → RESERVED → CONFIRMED
         ↘ (timeout)        ↘ (cancel)
           AVAILABLE          AVAILABLE
```

**Multi-channel Support:**
- Booking channels: WEB, TELEGRAM, WHATSAPP, PHONE, DASHBOARD
- Sale channels: ONLINE, POS_CASH, POS_TRANSFER, POS_CARD, PHONE

**Role-based Access:**
- SUPER_ADMIN: Platform-wide access (providerId = null)
- PROVIDER_ADMIN: Company-level management
- OPERATOR: POS sales, create reservations
- VIEWER: Read-only access

**Commission Tracking:**
- Provider commission rate (default 5%)
- Transaction splits: `amount`, `commission`, `providerAmount`
- User sales statistics: `salesCount`, `totalSalesAmount`

#### Seed Data
Generates realistic test data for Ecuador:
- 2 providers (Cotratudossa, Cuenca360)
- 4 vehicles (2 buses, 1 double-decker, 1 van)
- 5 service types + 5 services (Cuenca-Guayaquil, Cuenca-Quito, tours)
- 28 scheduled trips (next 7 days, 4 trips/day)
- 3 admin users (see "Test Credentials" section above)

**Note:** Re-run `pnpm db:seed` if trips are in the past.

#### Important: Decimal Field Handling

All Prisma `Decimal` types MUST be converted to `number` before API responses:
```typescript
// Affected models and fields:
Provider.commissionRate.toNumber()
Service.basePrice.toNumber()
ScheduledTrip.pricePerSeat.toNumber()
Reservation.subtotal.toNumber(), .commission.toNumber(), .total.toNumber()
Transaction.amount.toNumber(), .commission.toNumber(), .providerAmount.toNumber()
User.totalSalesAmount.toNumber()
```

## Common Development Tasks

### Adding a New API Endpoint

1. Create DTOs in `apps/api/src/modules/[module]/dto/`
2. Add method to service class using `PrismaService`
3. Add controller endpoint with proper decorators (@Public, @Roles, etc.)
4. **Convert Decimal fields to numbers** using `.toNumber()`
5. Update Swagger documentation with @ApiOperation, @ApiResponse

### Modifying Database Schema

1. Edit `packages/database/prisma/schema.prisma`
2. Generate migration: `pnpm --filter @transporte-platform/database migrate`
3. Regenerate client: `pnpm --filter @transporte-platform/database generate`
4. **Rebuild everything:** `pnpm build`
5. Restart API server

### Working with Shared Packages

After changes to `packages/database`, `packages/shared`, or `packages/ui`:
1. `pnpm build` - Rebuilds all packages
2. Restart dependent services (API, web, dashboard)

### Timezone Handling

**Backend:** Parse date strings in local timezone, not UTC
```typescript
// ❌ WRONG - Interprets as UTC midnight
const date = new Date("2025-12-15");

// ✅ CORRECT - Interprets in local timezone
const [year, month, day] = "2025-12-15".split('-').map(Number);
const date = new Date(year, month - 1, day);
```

**Frontend:** Use `parseISO()` from `date-fns` for ISO strings, `startOfDay()` for date comparisons.

## Troubleshooting

### "net::ERR_CONNECTION_REFUSED" on Frontend
**Cause:** API not running or not built
**Fix:**
```bash
pnpm build
pnpm --filter @transporte-platform/api start
```

### "SyntaxError: Unexpected token 'export'" on API Start
**Cause:** Database package not properly built
**Fix:** Already resolved. If it recurs, verify `packages/database/src/index.js` exports CommonJS modules.

### Decimal Type Errors (e.g., "toFixed is not a function")
**Cause:** Prisma Decimal not converted to number
**Fix:** Use `.toNumber()` on all Decimal fields in API services before returning data.

### Calendar Selects Wrong Date
**Cause:** Timezone mismatch (UTC vs local)
**Fix:** Already resolved. Backend uses local timezone parsing, frontend uses `parseISO()`.

### API Changes Not Reflected
**Fix:**
```bash
pnpm build                                 # Rebuild all packages
pnpm --filter @transporte-platform/api start  # Restart API
```

### Database Schema Out of Sync
**Fix:**
```bash
pnpm --filter @transporte-platform/database generate
pnpm --filter @transporte-platform/database migrate
pnpm build
```

## Critical Monorepo Rules

1. **Always run `pnpm build` after:**
   - Installing dependencies
   - Modifying `packages/database`, `packages/shared`, or `packages/ui`
   - Cloning the repository

2. **API restart required after code changes:**
   - `dev` mode watch may miss changes
   - Use production mode (`start`) for stability
   - Kill stuck processes: `taskkill //F //PID <pid>` (Windows)

3. **TypeScript configuration:**
   - API uses `strict: false` for Prisma compatibility
   - Frontends use strict mode
   - This is intentional for monorepo compatibility

4. **Package exports:**
   - `packages/database` exports CommonJS for NestJS compatibility
   - Uses `src/index.js` (runtime) + `src/index.ts` (types)

## Environment Variables

### Root `.env` (optional, shared)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transporte_db?schema=public"
```

### `apps/api/.env` (required)
```env
PORT=3001
DATABASE_URL="..."  # Can inherit from root
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="*"
APP_URL=http://localhost:3000

# Payment gateways (optional, mock mode if not configured)
# DEUNA_API_KEY=...
# PAYPHONE_TOKEN=...
```

### `apps/web/.env.local` (required)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### `apps/dashboard/.env.local` (required)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## URLs

- **API:** http://localhost:3001/api
- **API Docs (Swagger):** http://localhost:3001/api/docs
- **Public Web:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3002
- **Prisma Studio:** Runs on random port via `pnpm db:studio`
