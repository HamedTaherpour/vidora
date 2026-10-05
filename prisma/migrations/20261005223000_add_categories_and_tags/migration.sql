-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nameFa" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nameFa" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- Footage had zero rows in local development when this migration was authored,
-- so the required categoryId column can be added without a staged backfill.
ALTER TABLE "Footage" ADD COLUMN "categoryId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "FootageTag" (
    "footageId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "FootageTag_pkey" PRIMARY KEY ("footageId","tagId")
);

-- CreateIndex
CREATE INDEX "FootageTag_tagId_idx" ON "FootageTag"("tagId");

-- CreateIndex
CREATE INDEX "Footage_categoryId_idx" ON "Footage"("categoryId");

-- AddForeignKey
ALTER TABLE "Footage" ADD CONSTRAINT "Footage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FootageTag" ADD CONSTRAINT "FootageTag_footageId_fkey" FOREIGN KEY ("footageId") REFERENCES "Footage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FootageTag" ADD CONSTRAINT "FootageTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
