-- CreateEnum
CREATE TYPE "CargoType" AS ENUM ('EQUINE', 'GENERAL_CARGO', 'FOOD', 'PEOPLE');

-- CreateEnum
CREATE TYPE "CapacityUnit" AS ENUM ('SLOT', 'KG', 'M3', 'SEAT');

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "transporterProfileId" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trailers" (
    "id" TEXT NOT NULL,
    "transporterProfileId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "totalCapacity" INTEGER NOT NULL,
    "cargoType" "CargoType" NOT NULL DEFAULT 'EQUINE',
    "capacityUnit" "CapacityUnit" NOT NULL DEFAULT 'SLOT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trailers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_licensePlate_key" ON "vehicles"("licensePlate");

-- CreateIndex
CREATE INDEX "vehicles_transporterProfileId_idx" ON "vehicles"("transporterProfileId");

-- CreateIndex
CREATE INDEX "vehicles_transporterProfileId_isActive_idx" ON "vehicles"("transporterProfileId", "isActive");

-- CreateIndex
CREATE INDEX "vehicles_isActive_idx" ON "vehicles"("isActive");

-- CreateIndex
CREATE INDEX "trailers_transporterProfileId_idx" ON "trailers"("transporterProfileId");

-- CreateIndex
CREATE INDEX "trailers_transporterProfileId_isActive_idx" ON "trailers"("transporterProfileId", "isActive");

-- CreateIndex
CREATE INDEX "trailers_vehicleId_idx" ON "trailers"("vehicleId");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_transporterProfileId_fkey" FOREIGN KEY ("transporterProfileId") REFERENCES "transporter_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trailers" ADD CONSTRAINT "trailers_transporterProfileId_fkey" FOREIGN KEY ("transporterProfileId") REFERENCES "transporter_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trailers" ADD CONSTRAINT "trailers_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
