-- CreateEnum
CREATE TYPE "FootageFileUploadStatus" AS ENUM ('INITIATED', 'READY', 'FAILED', 'ABORTED');

-- AlterTable
-- Existing MEDIA-01 rows are completed physical files → READY.
-- Incomplete Admin uploads must never be treated as usable media.
ALTER TABLE "FootageFile"
ADD COLUMN "uploadStatus" "FootageFileUploadStatus" NOT NULL DEFAULT 'READY',
ADD COLUMN "providerUploadId" VARCHAR(255);

-- CreateIndex
CREATE INDEX "FootageFile_uploadStatus_idx" ON "FootageFile"("uploadStatus");
