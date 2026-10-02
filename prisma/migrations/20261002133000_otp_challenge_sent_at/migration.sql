-- Null `sentAt` means the challenge is reserved and was not successfully sent.
-- Rows created before this column were deleted on provider failure, so a
-- surviving row was treated as active. Record that delivery as `createdAt`.
-- This update does not delete rows or rewrite codes.
ALTER TABLE "OtpChallenge" ADD COLUMN "sentAt" TIMESTAMPTZ(3);

UPDATE "OtpChallenge" SET "sentAt" = "createdAt" WHERE "sentAt" IS NULL;
