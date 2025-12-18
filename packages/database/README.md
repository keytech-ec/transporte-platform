# Database Package

PostgreSQL database schema and configuration for the Transporte Platform using Prisma ORM.

## Overview

Multi-tenant transportation booking platform database with support for:
- Provider management (transport companies)
- Vehicle and seat configuration
- Services and scheduled trips
- Reservations and seat booking
- Payment processing
- User and role management
- POS (Point of Sale) system

## Quick Start

```bash
# Generate Prisma Client
pnpm generate

# Run migrations
pnpm migrate

# Seed test data
pnpm seed

# Open Prisma Studio (GUI)
pnpm studio

# Reset database (⚠️ Deletes all data)
pnpm migrate:reset
```

## Database Schema

### Core Entity Relationships

```
Provider (Transport Company)
├── Vehicles
│   └── Seats
├── Services (Routes/Tours)
│   └── ScheduledTrips
│       ├── TripSeats (Seat availability)
│       └── Reservations
│           ├── ReservationSeats (Seat assignments)
│           ├── Passengers
│           └── Transactions (Payments)
└── Users (Admin/Operators)
    ├── soldReservations (Sales tracking)
    └── receivedTransactions (Payment tracking)

Customer
└── Reservations
```

## Models Reference

### 1. Provider (Multi-tenant Companies)

**Purpose:** Transport companies that operate on the platform

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `ruc` | String(13) | Unique tax ID (Ecuador) |
| `businessName` | String(200) | Legal company name |
| `email` | String | Contact email (unique) |
| `phone` | String(20) | Contact phone |
| `commissionRate` | Decimal(5,2) | Platform commission % (default: 5%) |
| `status` | ProviderStatus | PENDING, ACTIVE, SUSPENDED, INACTIVE |
| `bankAccount` | String(50)? | Payment account |

**Relationships:**
- Has many: Vehicles, Services, Users, Transactions

---

### 2. Vehicle

**Purpose:** Buses, vans, and other transport vehicles

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `providerId` | UUID | Owner provider |
| `plate` | String(10) | License plate (unique) |
| `brand` | String(50) | Manufacturer |
| `model` | String(50) | Vehicle model |
| `year` | Int | Manufacturing year |
| `totalSeats` | Int | Total seat capacity |
| `seatLayout` | JSON? | Seat configuration `{"rows": 10, "seatsPerRow": 4, "layout": "2-2"}` |
| `type` | VehicleType | VAN, MINIBUS, BUS, DOUBLE_DECKER, SUV |
| `amenities` | JSON? | Features `{"wifi": true, "ac": true, "bathroom": true, "tv": true}` |

**Relationships:**
- Belongs to: Provider
- Has many: Seats, ScheduledTrips

---

### 3. Seat

**Purpose:** Individual seats within vehicles

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `vehicleId` | UUID | Parent vehicle |
| `seatNumber` | String(10) | Identifier (e.g., "1A", "2B") |
| `row` | Int | Row number |
| `column` | Int | Column position |
| `position` | SeatPosition | WINDOW, AISLE, MIDDLE |
| `tier` | SeatTier | STANDARD, PREMIUM, VIP, LOWER_DECK, UPPER_DECK |

**Unique Constraint:** `vehicleId + seatNumber`

**Relationships:**
- Belongs to: Vehicle
- Has many: TripSeats, ReservationSeats

---

### 4. ServiceType

**Purpose:** Categorization of transportation services

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | String(50) | Service type name (unique) |
| `requiresQuote` | Boolean | Custom pricing required (default: false) |

**Examples:** "Interprovincial", "Urban", "Tourism", "Private Charter"

---

### 5. Service (Routes/Tours)

**Purpose:** Regular routes or tour packages offered by providers

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `providerId` | UUID | Operator provider |
| `serviceTypeId` | UUID | Service category |
| `origin` | String(100) | Departure location |
| `destination` | String(100) | Arrival location |
| `name` | String(200) | Display name |
| `basePrice` | Decimal(10,2)? | Starting price per seat |
| `duration` | Int? | Trip duration in minutes |
| `seatSelectionMode` | SeatSelectionMode | **NEW:** Seat assignment mode (default: REQUIRED) |
| `requiresPassengerInfo` | Boolean | **NEW:** Requires full passenger details (default: true) |

**Seat Selection Modes:**
- `NONE`: Quantity-only bookings (no specific seat assignment)
- `OPTIONAL`: Seats can be selected but not required
- `REQUIRED`: Must select specific seats (traditional behavior)

**Indexes:** `providerId`, `origin + destination`

**Relationships:**
- Belongs to: Provider, ServiceType
- Has many: ScheduledTrips

---

### 6. ScheduledTrip

**Purpose:** Specific trip instances with date, time, and vehicle assignment

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `serviceId` | UUID | Parent service/route |
| `vehicleId` | UUID | Assigned vehicle |
| `departureDate` | Date | Trip date |
| `departureTime` | Time | Departure time |
| `totalSeats` | Int | Total available seats |
| `availableSeats` | Int | Currently available (dynamic) |
| `pricePerSeat` | Decimal(10,2) | Price for this trip |
| `bookingMode` | BookingMode | PER_SEAT, FULL_VEHICLE, BOTH |
| `status` | TripStatus | SCHEDULED, BOARDING, IN_PROGRESS, COMPLETED, CANCELLED |
| `seatSelectionMode` | SeatSelectionMode? | **NEW:** Optional override (NULL = inherit from Service) |

**Indexes:** `serviceId + departureDate`, `vehicleId + departureDate`, `departureDate + status`

**Relationships:**
- Belongs to: Service, Vehicle
- Has many: Reservations, TripSeats

---

### 7. TripSeat

**Purpose:** Seat availability and status for each trip

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `tripId` | UUID | Parent scheduled trip |
| `seatId` | UUID | Physical seat reference |
| `status` | SeatStatus | AVAILABLE, LOCKED, RESERVED, CONFIRMED, BLOCKED |
| `lockedUntil` | DateTime? | Temporary lock expiration (15 min) |

**Unique Constraint:** `tripId + seatId`

**Relationships:**
- Belongs to: ScheduledTrip, Seat
- Has one: ReservationSeat (when booked)

**Status Flow:**
```
AVAILABLE → LOCKED (15 min) → RESERVED → CONFIRMED
         ↘                  ↘
           AVAILABLE (timeout)  AVAILABLE (cancelled)
```

---

### 8. Customer

**Purpose:** Passengers who make bookings

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `documentType` | DocumentType | CEDULA, RUC, PASSPORT |
| `documentNumber` | String(20) | ID number |
| `firstName` | String(100) | First name |
| `lastName` | String(100) | Last name |
| `email` | String(100)? | Email address |
| `phone` | String(20) | Contact phone |

**Unique Constraint:** `documentType + documentNumber`

**Indexes:** `email`, `phone`

**Relationships:**
- Has many: Reservations

---

### 9. Reservation

**Purpose:** Booking records linking customers to trips

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `tripId` | UUID | Scheduled trip |
| `customerId` | UUID | Booking customer |
| `soldById` | UUID? | POS operator/seller |
| `bookingReference` | String(10) | Unique code for lookup |
| `reservationType` | ReservationType | PER_SEAT, FULL_VEHICLE |
| `numPassengers` | Int | Total passengers |
| `subtotal` | Decimal(10,2) | Base amount |
| `commission` | Decimal(10,2) | Platform fee |
| `total` | Decimal(10,2) | Final amount |
| `status` | ReservationStatus | PENDING, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED, REFUNDED, NO_SHOW |
| `channel` | BookingChannel | WEB, TELEGRAM, WHATSAPP, PHONE, DASHBOARD |
| `saleChannel` | SaleChannel | ONLINE, POS_CASH, POS_TRANSFER, POS_CARD, PHONE |
| `passengerFormToken` | String(50)? | WhatsApp form token |
| `passengerFormExpiresAt` | DateTime? | Form expiration |
| `passengerFormCompletedAt` | DateTime? | Form completion time |
| `notes` | Text? | Additional notes |

**Unique Constraints:** `bookingReference`, `passengerFormToken`

**Indexes:** `tripId`, `customerId`, `soldById`, `status + createdAt`, `bookingReference`, `passengerFormToken`

**Relationships:**
- Belongs to: ScheduledTrip, Customer, User (seller)
- Has many: Passengers, ReservationSeats, Transactions

---

### 10. Passenger

**Purpose:** Individual travelers in a reservation

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `reservationId` | UUID | Parent reservation |
| `documentType` | DocumentType | CEDULA, RUC, PASSPORT |
| `documentNumber` | String(20) | ID number |
| `firstName` | String(100) | First name |
| `lastName` | String(100) | Last name |
| `passengerType` | PassengerType | ADULT, CHILD, INFANT, SENIOR |

**Relationships:**
- Belongs to: Reservation
- Has one: ReservationSeat (seat assignment)

---

### 11. ReservationSeat

**Purpose:** Links passengers to specific seats in reservations

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `reservationId` | UUID | Parent reservation |
| `tripSeatId` | UUID | Trip seat instance (unique) |
| `passengerId` | UUID? | Assigned passenger (unique) |
| `seatId` | UUID? | **UPDATED:** Physical seat reference (nullable for quantity-only bookings) |
| `floorNumber` | Int? | **NEW:** Floor assignment for multi-floor vehicles (1, 2, 3, etc.) |

**Use Cases:**
- Seat-based booking: `seatId` populated with specific seat
- Quantity-only booking: `seatId = NULL`, `floorNumber` optional for multi-floor vehicles

**Unique Constraints:** `tripSeatId`, `passengerId`

**Relationships:**
- Belongs to: Reservation, TripSeat, Passenger (optional), Seat (optional)

---

### 12. Transaction (Payments)

**Purpose:** Payment records for reservations

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `reservationId` | UUID | Related reservation |
| `providerId` | UUID | Service provider |
| `receivedBy` | UUID? | POS operator who received payment |
| `amount` | Decimal(10,2) | Payment amount |
| `commission` | Decimal(10,2) | Platform commission |
| `providerAmount` | Decimal(10,2) | Amount for provider |
| `gateway` | PaymentGateway | DEUNA, PAYPHONE, CASH, TRANSFER |
| `paymentMethod` | PaymentMethod? | CASH, BANK_TRANSFER, CREDIT_CARD, etc. |
| `status` | TransactionStatus | PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED, PARTIALLY_REFUNDED |
| `isPartialPayment` | Boolean | Partial payment flag (default: false) |
| `receiptNumber` | String(50)? | Receipt/transaction reference |

**Indexes:** `reservationId`, `providerId + status`, `receivedBy`

**Relationships:**
- Belongs to: Reservation, Provider, User (receiver)

---

### 13. User (Dashboard Users)

**Purpose:** Operators and administrators for the platform and providers

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `providerId` | UUID? | Null = platform super admin |
| `email` | String | Login email (unique) |
| `passwordHash` | String | Bcrypt password hash |
| `firstName` | String(100) | First name |
| `lastName` | String(100) | Last name |
| `role` | UserRole | SUPER_ADMIN, PROVIDER_ADMIN, OPERATOR, VIEWER |
| `status` | UserStatus | ACTIVE, INACTIVE, SUSPENDED |
| `salesCount` | Int | Total sales made (default: 0) |
| `totalSalesAmount` | Decimal(12,2) | Total sales value (default: 0) |

**Roles:**
- `SUPER_ADMIN`: Platform administrator (full access)
- `PROVIDER_ADMIN`: Company admin (provider-specific)
- `OPERATOR`: POS operator, can create reservations
- `VIEWER`: Read-only access

**Relationships:**
- Belongs to: Provider (optional)
- Has many: soldReservations, receivedTransactions

---

## Critical Implementation Notes

### 1. Prisma Decimal Type

**IMPORTANT:** All `Decimal` fields must be converted to JavaScript `number` before returning from API.

```typescript
// ❌ WRONG - Returns Prisma Decimal object
return { pricePerSeat: trip.pricePerSeat }

// ✅ CORRECT - Converts to number
return { pricePerSeat: trip.pricePerSeat.toNumber() }
```

**Affected Fields:**
- `Provider`: `commissionRate`
- `Service`: `basePrice`
- `ScheduledTrip`: `pricePerSeat`
- `Reservation`: `subtotal`, `commission`, `total`
- `Transaction`: `amount`, `commission`, `providerAmount`
- `User`: `totalSalesAmount`

### 2. Date/Time Handling

**Backend (NestJS):**
```typescript
// ❌ WRONG - Parses as UTC midnight
const date = new Date("2025-12-15");

// ✅ CORRECT - Parses in local timezone
const [year, month, day] = "2025-12-15".split('-').map(Number);
const date = new Date(year, month - 1, day);
```

**Frontend:**
```typescript
import { parseISO, startOfDay } from 'date-fns';

const date = parseISO("2025-12-15T00:00:00.000Z");
```

### 3. Seat Locking Flow

```typescript
// Lock seats for 15 minutes during checkout
lockedUntil: new Date(Date.now() + 15 * 60 * 1000)

// Cleanup expired locks periodically
await prisma.tripSeat.updateMany({
  where: {
    status: 'LOCKED',
    lockedUntil: { lt: new Date() }
  },
  data: { status: 'AVAILABLE', lockedUntil: null }
});
```

### 4. Transaction Safety

**Always use Prisma transactions for:**
- Creating reservations (update trip seats + create reservation)
- Confirming payments (update transaction + reservation status + seat status)
- Cancelling reservations (update status + release seats + process refunds)

```typescript
await prisma.$transaction(async (tx) => {
  // Multiple operations here
});
```

## Seed Data

Running `pnpm seed` generates:

### Providers
- **Cotratudossa** (RUC: 0190123456001)
- **Cuenca360** (RUC: 0190654321001)

### Service Types
- Interprovincial
- Tourism
- Urban
- Private Charter
- Airport Transfer

### Vehicles (4 total)
- 2 Buses (40 seats, 2-2 layout)
- 1 Double-decker (60 seats, 2-2 layout)
- 1 Van (15 seats, 2-1 layout)

### Services
- Cuenca → Guayaquil (Interprovincial)
- Cuenca → Quito (Interprovincial)
- Cajas National Park Tour (Tourism)
- Cuenca City Tour (Tourism)
- Airport Transfer (Airport)

### Scheduled Trips
- 28 trips over next 7 days
- 4 trips per day across different routes
- Various times: 06:00, 10:30, 14:00, 18:30

### Users (Test Credentials)
```
Super Admin:
  Email: admin@platform.com
  Password: Test123!

Provider Admin (Cotratudossa):
  Email: admin@cotratudossa.com
  Password: Test123!

Provider Admin (Cuenca360):
  Email: admin@cuenca360.com
  Password: Test123!
```

## Database Migrations

### Create New Migration

```bash
# Edit schema.prisma, then:
pnpm --filter @transporte-platform/database migrate

# Provide migration name when prompted
# Example: "add_passenger_form_fields"
```

### Reset Database (⚠️ Destroys all data)

```bash
pnpm --filter @transporte-platform/database migrate:reset
# Automatically runs seed after reset
```

### Regenerate Prisma Client

```bash
pnpm --filter @transporte-platform/database generate
```

**Required after:**
- Schema changes
- Fresh clone of repository
- Installing dependencies

## Connection String

Default PostgreSQL connection (Docker):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transporte_db?schema=public"
```

Set in:
- Root `.env` (shared)
- `apps/api/.env` (override)

## Prisma Studio

Visual database editor:
```bash
pnpm db:studio
# Opens at http://localhost:5555 (random port)
```

Features:
- Browse all tables
- Edit records inline
- Filter and search
- View relationships

## Performance Considerations

### Indexes

Existing indexes optimize:
- Trip searches by date and location
- Reservation lookups by reference
- Customer lookups by email/phone
- Transaction queries by provider and status

### Connection Pooling

Prisma automatically manages connection pool. Configure in schema.prisma if needed:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // For migrations
}
```

## Troubleshooting

### "Schema out of sync" Error
```bash
pnpm --filter @transporte-platform/database generate
pnpm build  # Rebuild all packages
```

### Prisma Client Not Found
```bash
pnpm install
pnpm --filter @transporte-platform/database generate
pnpm build
```

### Migration Conflicts
```bash
# Reset database (⚠️ deletes data)
pnpm --filter @transporte-platform/database migrate:reset

# Or resolve manually:
pnpm --filter @transporte-platform/database migrate resolve --applied "migration_name"
```

### Connection Refused
Ensure PostgreSQL is running:
```bash
docker-compose -f docker/docker-compose.yml up -d
```

## Package Exports

This package exports CommonJS modules for NestJS compatibility:

**src/index.js** (Runtime):
```javascript
module.exports = { PrismaClient };
```

**src/index.ts** (Types):
```typescript
export * from '@prisma/client';
export { PrismaClient } from '@prisma/client';
```

Used by API:
```typescript
import { PrismaClient } from '@transporte-platform/database';
```

## Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Project CLAUDE.md**: See root `/CLAUDE.md` for full project documentation
