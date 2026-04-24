-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM (
    'PENDING_PAYMENT',
    'CONFIRMED',
    'IN_PROGRESS',
    'DELIVERED_PENDING_CONFIRMATION',
    'COMPLETED',
    'CANCELLED',
    'DISPUTED'
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "tripOfferId" TEXT NOT NULL,
    "clientAccountId" TEXT NOT NULL,
    "requestedUnits" INTEGER NOT NULL,
    "unitPriceSnapshot" INTEGER NOT NULL,
    "totalPriceSnapshot" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookings_tripOfferId_idx"
ON "bookings"("tripOfferId");

-- CreateIndex
CREATE INDEX "bookings_clientAccountId_idx"
ON "bookings"("clientAccountId");

-- CreateIndex
CREATE INDEX "bookings_status_idx"
ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_expiresAt_idx"
ON "bookings"("expiresAt");

-- CreateIndex
CREATE INDEX "bookings_tripOfferId_status_idx"
ON "bookings"("tripOfferId", "status");

-- CreateIndex
CREATE INDEX "bookings_clientAccountId_createdAt_idx"
ON "bookings"("clientAccountId", "createdAt");

-- AddForeignKey
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_tripOfferId_fkey"
FOREIGN KEY ("tripOfferId")
REFERENCES "trip_offers"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_clientAccountId_fkey"
FOREIGN KEY ("clientAccountId")
REFERENCES "accounts"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
