-- CreateEnum
CREATE TYPE "FootageFileKind" AS ENUM ('PREVIEW', 'ORIGINAL');

-- CreateTable
CREATE TABLE "FootageFile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "footageId" UUID NOT NULL,
    "kind" "FootageFileKind" NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "objectKey" VARCHAR(1024) NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "mimeType" VARCHAR(127) NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "fps" DECIMAL(10,3),
    "codec" VARCHAR(64),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "FootageFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FootageFile_objectKey_key" ON "FootageFile"("objectKey");

-- CreateIndex
CREATE INDEX "FootageFile_footageId_idx" ON "FootageFile"("footageId");

-- Prisma ORM 7.10 cannot represent partial unique indexes in schema.prisma.
-- Each Footage may have at most one PREVIEW FootageFile. ORIGINAL rows are
-- unrestricted by this index. The enum value matches FootageFileKind.
CREATE UNIQUE INDEX "FootageFile_one_preview_per_footage_key"
ON "FootageFile" ("footageId")
WHERE "kind" = 'PREVIEW';

-- AddForeignKey
ALTER TABLE "FootageFile" ADD CONSTRAINT "FootageFile_footageId_fkey" FOREIGN KEY ("footageId") REFERENCES "Footage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
