-- CreateTable
CREATE TABLE "OtpRequestEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "phone" VARCHAR(13) NOT NULL,
    "clientIp" VARCHAR(45) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpRequestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpRequestEvent_phone_createdAt_idx" ON "OtpRequestEvent"("phone", "createdAt");

-- CreateIndex
CREATE INDEX "OtpRequestEvent_clientIp_createdAt_idx" ON "OtpRequestEvent"("clientIp", "createdAt");

-- Prisma ORM 7.10 cannot represent CHECK constraints in schema.prisma.
-- Same canonical phone rule as OtpChallenge: +989XXXXXXXXX.
ALTER TABLE "OtpRequestEvent" ADD CONSTRAINT "OtpRequestEvent_phone_canonical_check" CHECK ("phone" ~ '^\+989[0-9]{9}$');
