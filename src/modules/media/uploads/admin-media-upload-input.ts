import { z } from "zod";

import { MAX_FOOTAGE_UPLOAD_BYTES } from "@/modules/media/uploads/upload-limits";

const uuidSchema = z.uuid();

export const initiateAdminMediaUploadInputSchema = z
  .object({
    footageId: uuidSchema,
    kind: z.enum(["PREVIEW", "ORIGINAL"]),
    label: z.string().trim().min(1).max(120).optional(),
    sizeBytes: z
      .number()
      .int()
      .positive()
      .max(MAX_FOOTAGE_UPLOAD_BYTES, {
        message: `must be at most ${MAX_FOOTAGE_UPLOAD_BYTES} bytes (2 GiB)`,
      }),
    mimeType: z.string().trim().min(1).max(127),
    fileName: z.string().trim().min(1).max(255).optional(),
  })
  .superRefine((value, context) => {
    if (value.kind === "ORIGINAL" && value.label === undefined) {
      context.addIssue({
        code: "custom",
        path: ["label"],
        message: "ORIGINAL uploads require a label.",
      });
    }
  });

export type InitiateAdminMediaUploadInput = z.infer<
  typeof initiateAdminMediaUploadInputSchema
>;

export const signAdminMediaUploadPartInputSchema = z.object({
  uploadId: uuidSchema,
  partNumber: z.number().int().min(1).max(10_000),
});

export type SignAdminMediaUploadPartInput = z.infer<
  typeof signAdminMediaUploadPartInputSchema
>;

export const completeAdminMediaUploadInputSchema = z.object({
  uploadId: uuidSchema,
  parts: z
    .array(
      z.object({
        partNumber: z.number().int().min(1).max(10_000),
        etag: z.string().trim().min(1).max(255),
      }),
    )
    .min(1)
    .max(10_000),
});

export type CompleteAdminMediaUploadInput = z.infer<
  typeof completeAdminMediaUploadInputSchema
>;

export const abortAdminMediaUploadInputSchema = z.object({
  uploadId: uuidSchema,
});

export type AbortAdminMediaUploadInput = z.infer<
  typeof abortAdminMediaUploadInputSchema
>;
