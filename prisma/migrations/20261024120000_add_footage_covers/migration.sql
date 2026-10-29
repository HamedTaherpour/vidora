-- CreateTable
CREATE TABLE "FootageCover" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "footageId" UUID NOT NULL,
    "objectKey" VARCHAR(1024) NOT NULL,
    "mimeType" VARCHAR(127) NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "FootageCover_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FootageCover_footageId_key" ON "FootageCover"("footageId");
CREATE UNIQUE INDEX "FootageCover_objectKey_key" ON "FootageCover"("objectKey");

-- AddForeignKey
ALTER TABLE "FootageCover" ADD CONSTRAINT "FootageCover_footageId_fkey"
  FOREIGN KEY ("footageId") REFERENCES "Footage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
