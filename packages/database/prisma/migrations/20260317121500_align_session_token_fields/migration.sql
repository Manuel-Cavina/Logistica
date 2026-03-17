-- Rename the refresh token column to the canonical auth-strategy name.
ALTER TABLE "sessions" RENAME COLUMN "refreshTokenHash" TO "tokenHash";

-- Add token family support required for refresh rotation and reuse detection.
ALTER TABLE "sessions" ADD COLUMN "tokenFamily" TEXT;

UPDATE "sessions"
SET "tokenFamily" = "id"
WHERE "tokenFamily" IS NULL;

ALTER TABLE "sessions" ALTER COLUMN "tokenFamily" SET NOT NULL;

CREATE INDEX "sessions_tokenFamily_idx" ON "sessions"("tokenFamily");
