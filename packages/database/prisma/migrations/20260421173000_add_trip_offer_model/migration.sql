-- CreateEnum
CREATE TYPE "TripOfferStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'FULL',
    'CLOSED',
    'CANCELLED'
);

-- CreateTable
CREATE TABLE "trip_offers" (
    "id" TEXT NOT NULL,
    "transporterProfileId" TEXT NOT NULL,
    "originLabel" TEXT NOT NULL,
    "originLat" DECIMAL(9,6) NOT NULL,
    "originLng" DECIMAL(9,6) NOT NULL,
    "destinationLabel" TEXT NOT NULL,
    "destinationLat" DECIMAL(9,6) NOT NULL,
    "destinationLng" DECIMAL(9,6) NOT NULL,
    "departureDate" TIMESTAMP(3),
    "departureWindowStart" TIMESTAMP(3),
    "departureWindowEnd" TIMESTAMP(3),
    "capacityTotal" INTEGER NOT NULL,
    "availableCapacity" INTEGER NOT NULL,
    "pricePerSlot" INTEGER NOT NULL,
    "maxDetourKm" INTEGER,
    "notes" TEXT,
    "cancellationPolicy" TEXT,
    "cargoType" "CargoType" NOT NULL DEFAULT 'EQUINE',
    "isReturn" BOOLEAN NOT NULL DEFAULT false,
    "status" "TripOfferStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_offers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "trip_offers_capacityTotal_check" CHECK ("capacityTotal" > 0),
    CONSTRAINT "trip_offers_availableCapacity_check" CHECK (
        "availableCapacity" >= 0
        AND "availableCapacity" <= "capacityTotal"
    )
);

-- CreateIndex
CREATE INDEX "trip_offers_transporterProfileId_idx"
ON "trip_offers"("transporterProfileId");

-- CreateIndex
CREATE INDEX "trip_offers_transporterProfileId_status_idx"
ON "trip_offers"("transporterProfileId", "status");

-- CreateIndex
CREATE INDEX "trip_offers_status_idx"
ON "trip_offers"("status");

-- CreateIndex
CREATE INDEX "trip_offers_cargoType_status_idx"
ON "trip_offers"("cargoType", "status");

-- AddForeignKey
ALTER TABLE "trip_offers"
ADD CONSTRAINT "trip_offers_transporterProfileId_fkey"
FOREIGN KEY ("transporterProfileId")
REFERENCES "transporter_profiles"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
