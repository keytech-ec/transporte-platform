-- CreateEnum
CREATE TYPE "SeatSelectionMode" AS ENUM ('NONE', 'OPTIONAL', 'REQUIRED');

-- AlterTable
ALTER TABLE "reservation_seats" ADD COLUMN "floorNumber" INTEGER,
ALTER COLUMN "seatId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "scheduled_trips" ADD COLUMN "seatSelectionMode" "SeatSelectionMode";

-- AlterTable
ALTER TABLE "services" ADD COLUMN "requiresPassengerInfo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "seatSelectionMode" "SeatSelectionMode" NOT NULL DEFAULT 'REQUIRED';

-- CreateIndex
CREATE INDEX "scheduled_trips_departureDate_serviceId_status_idx" ON "scheduled_trips"("departureDate", "serviceId", "status");
