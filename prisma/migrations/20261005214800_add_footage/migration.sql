-- CreateEnum
CREATE TYPE "FootageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Footage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titleFa" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "descriptionFa" TEXT NOT NULL,
    "priceToman" INTEGER NOT NULL,
    "status" "FootageStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "publishedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Footage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Footage_slug_key" ON "Footage"("slug");

-- CreateIndex
CREATE INDEX "Footage_status_idx" ON "Footage"("status");

-- Prisma ORM 7.10 cannot represent CHECK constraints in schema.prisma.
-- Integer Toman prices must never be negative. Zero is allowed at persistence.
ALTER TABLE "Footage" ADD CONSTRAINT "Footage_priceToman_non_negative_check" CHECK ("priceToman" >= 0);

-- DRAFT requires null publishedAt. PUBLISHED requires a non-null publishedAt.
-- Scheduled publishing is not supported.
ALTER TABLE "Footage" ADD CONSTRAINT "Footage_published_state_check" CHECK (
    ("status" = 'DRAFT' AND "publishedAt" IS NULL)
    OR ("status" = 'PUBLISHED' AND "publishedAt" IS NOT NULL)
);
