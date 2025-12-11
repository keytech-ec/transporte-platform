-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('VAN', 'MINIBUS', 'BUS', 'DOUBLE_DECKER', 'SUV');

-- CreateEnum
CREATE TYPE "SeatPosition" AS ENUM ('WINDOW', 'AISLE', 'MIDDLE');

-- CreateEnum
CREATE TYPE "SeatTier" AS ENUM ('STANDARD', 'PREMIUM', 'VIP', 'LOWER_DECK', 'UPPER_DECK');

-- CreateEnum
CREATE TYPE "BookingMode" AS ENUM ('PER_SEAT', 'FULL_VEHICLE', 'BOTH');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('SCHEDULED', 'BOARDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'LOCKED', 'RESERVED', 'CONFIRMED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CEDULA', 'RUC', 'PASSPORT');

-- CreateEnum
CREATE TYPE "ReservationType" AS ENUM ('PER_SEAT', 'FULL_VEHICLE');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "BookingChannel" AS ENUM ('WEB', 'TELEGRAM', 'WHATSAPP', 'PHONE', 'DASHBOARD');

-- CreateEnum
CREATE TYPE "PassengerType" AS ENUM ('ADULT', 'CHILD', 'INFANT', 'SENIOR');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('DEUNA', 'PAYPHONE', 'CASH', 'TRANSFER');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'PROVIDER_ADMIN', 'OPERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "ruc" VARCHAR(13) NOT NULL,
    "businessName" VARCHAR(200) NOT NULL,
    "email" TEXT NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 5.0,
    "status" "ProviderStatus" NOT NULL DEFAULT 'PENDING',
    "bankAccount" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "plate" VARCHAR(10) NOT NULL,
    "brand" VARCHAR(50) NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "seatLayout" JSONB,
    "type" "VehicleType" NOT NULL,
    "amenities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "seatNumber" VARCHAR(10) NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "position" "SeatPosition" NOT NULL,
    "tier" "SeatTier" NOT NULL DEFAULT 'STANDARD',

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_types" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "requiresQuote" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "origin" VARCHAR(100) NOT NULL,
    "destination" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "basePrice" DECIMAL(10,2),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_trips" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "departureDate" DATE NOT NULL,
    "departureTime" TIME NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "pricePerSeat" DECIMAL(10,2) NOT NULL,
    "bookingMode" "BookingMode" NOT NULL DEFAULT 'PER_SEAT',
    "status" "TripStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_seats" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "status" "SeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "trip_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL DEFAULT 'CEDULA',
    "documentNumber" VARCHAR(20) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "phone" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "bookingReference" VARCHAR(10) NOT NULL,
    "reservationType" "ReservationType" NOT NULL,
    "numPassengers" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "channel" "BookingChannel" NOT NULL DEFAULT 'WEB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passengers" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "documentNumber" VARCHAR(20) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "passengerType" "PassengerType" NOT NULL DEFAULT 'ADULT',

    CONSTRAINT "passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_seats" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "tripSeatId" TEXT NOT NULL,
    "passengerId" TEXT,
    "seatId" TEXT NOT NULL,

    CONSTRAINT "reservation_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "commission" DECIMAL(10,2) NOT NULL,
    "providerAmount" DECIMAL(10,2) NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "providerId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "providers_ruc_key" ON "providers"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "providers_email_key" ON "providers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE INDEX "vehicles_providerId_idx" ON "vehicles"("providerId");

-- CreateIndex
CREATE INDEX "seats_vehicleId_idx" ON "seats"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "seats_vehicleId_seatNumber_key" ON "seats"("vehicleId", "seatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "service_types_name_key" ON "service_types"("name");

-- CreateIndex
CREATE INDEX "services_providerId_idx" ON "services"("providerId");

-- CreateIndex
CREATE INDEX "services_origin_destination_idx" ON "services"("origin", "destination");

-- CreateIndex
CREATE INDEX "scheduled_trips_serviceId_departureDate_idx" ON "scheduled_trips"("serviceId", "departureDate");

-- CreateIndex
CREATE INDEX "scheduled_trips_vehicleId_departureDate_idx" ON "scheduled_trips"("vehicleId", "departureDate");

-- CreateIndex
CREATE INDEX "scheduled_trips_departureDate_status_idx" ON "scheduled_trips"("departureDate", "status");

-- CreateIndex
CREATE INDEX "trip_seats_tripId_status_idx" ON "trip_seats"("tripId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "trip_seats_tripId_seatId_key" ON "trip_seats"("tripId", "seatId");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "customers_documentType_documentNumber_key" ON "customers"("documentType", "documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_bookingReference_key" ON "reservations"("bookingReference");

-- CreateIndex
CREATE INDEX "reservations_tripId_idx" ON "reservations"("tripId");

-- CreateIndex
CREATE INDEX "reservations_customerId_idx" ON "reservations"("customerId");

-- CreateIndex
CREATE INDEX "reservations_status_createdAt_idx" ON "reservations"("status", "createdAt");

-- CreateIndex
CREATE INDEX "reservations_bookingReference_idx" ON "reservations"("bookingReference");

-- CreateIndex
CREATE INDEX "passengers_reservationId_idx" ON "passengers"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_seats_tripSeatId_key" ON "reservation_seats"("tripSeatId");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_seats_passengerId_key" ON "reservation_seats"("passengerId");

-- CreateIndex
CREATE INDEX "reservation_seats_reservationId_idx" ON "reservation_seats"("reservationId");

-- CreateIndex
CREATE INDEX "transactions_reservationId_idx" ON "transactions"("reservationId");

-- CreateIndex
CREATE INDEX "transactions_providerId_status_idx" ON "transactions"("providerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_providerId_idx" ON "users"("providerId");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_trips" ADD CONSTRAINT "scheduled_trips_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_trips" ADD CONSTRAINT "scheduled_trips_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_seats" ADD CONSTRAINT "trip_seats_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "scheduled_trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_seats" ADD CONSTRAINT "trip_seats_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "scheduled_trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_seats" ADD CONSTRAINT "reservation_seats_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_seats" ADD CONSTRAINT "reservation_seats_tripSeatId_fkey" FOREIGN KEY ("tripSeatId") REFERENCES "trip_seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_seats" ADD CONSTRAINT "reservation_seats_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "passengers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_seats" ADD CONSTRAINT "reservation_seats_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
