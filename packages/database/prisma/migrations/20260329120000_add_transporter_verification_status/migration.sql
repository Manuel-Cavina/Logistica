-- CreateEnum
CREATE TYPE "TransporterVerificationStatus" AS ENUM (
  'INCOMPLETE',
  'PENDING',
  'VERIFIED',
  'REJECTED'
);

-- AlterTable
ALTER TABLE "transporter_profiles"
ADD COLUMN "verificationStatus" "TransporterVerificationStatus" NOT NULL DEFAULT 'INCOMPLETE';
