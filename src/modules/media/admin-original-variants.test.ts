import { describe, expect, it, vi } from "vitest";

import {
  handleAdminUpdateOriginalVariantLabel,
  type AdminOriginalVariant,
  type AdminOriginalVariantStore,
} from "@/modules/media/admin-original-variants";

const FOOTAGE_A = "11111111-1111-4111-8111-111111111111";
const FOOTAGE_B = "22222222-2222-4222-8222-222222222222";
const VARIANT_A = "33333333-3333-4333-8333-333333333333";
const PREVIEW_ID = "44444444-4444-4444-8444-444444444444";
const NOW = new Date("2026-10-22T08:00:00.000Z");
const ADMIN = {
  status: "authenticated" as const,
  adminId: "admin-1",
  phone: "+989121234567",
  expiresAt: NOW,
};
const ANONYMOUS = { status: "anonymous" as const };

function variant(
  overrides: Partial<AdminOriginalVariant> = {},
): AdminOriginalVariant {
  return {
    id: VARIANT_A,
    footageId: FOOTAGE_A,
    label: "1080p",
    sizeBytes: 2_000,
    mimeType: "video/mp4",
    uploadStatus: "READY",
    width: 1920,
    height: 1080,
    fps: "29.970",
    codec: "h264",
    createdAt: NOW,
    ...overrides,
  };
}

function createStore(rows: AdminOriginalVariant[]): AdminOriginalVariantStore {
  return {
    async listForFootage(footageId) {
      return rows.filter((row) => row.footageId === footageId);
    },
    updateLabel: vi.fn(async ({ footageId, variantId, label }) => {
      const row = rows.find(
        (candidate) =>
          candidate.id === variantId &&
          candidate.footageId === footageId &&
          candidate.id !== PREVIEW_ID,
      );
      if (!row) return null;
      row.label = label;
      return row;
    }),
  };
}

describe("Admin original variant management", () => {
  it("allows multiple variants and duplicate open-ended labels", async () => {
    const rows = [
      variant(),
      variant({ id: "55555555-5555-4555-8555-555555555555", label: "1080p" }),
    ];
    const store = createStore(rows);

    expect(await store.listForFootage(FOOTAGE_A)).toHaveLength(2);
    const result = await handleAdminUpdateOriginalVariantLabel({
      admin: ADMIN,
      footageId: FOOTAGE_A,
      variantId: rows[1]!.id,
      body: { label: "ProRes Master" },
      store,
    });

    expect(result.status).toBe("ok");
    expect(rows[0]!.label).toBe("1080p");
    expect(rows[1]!.label).toBe("ProRes Master");
  });

  it.each([
    { label: "", name: "empty" },
    { label: " ", name: "whitespace" },
    { label: "x".repeat(121), name: "too long" },
  ])("rejects $name labels", async ({ label }) => {
    const store = createStore([variant()]);
    await expect(
      handleAdminUpdateOriginalVariantLabel({
        admin: ADMIN,
        footageId: FOOTAGE_A,
        variantId: VARIANT_A,
        body: { label },
        store,
      }),
    ).resolves.toEqual({ status: "invalid_input" });
  });

  it("denies anonymous or Customer callers and rejects cross-Footage access", async () => {
    const store = createStore([variant()]);

    await expect(
      handleAdminUpdateOriginalVariantLabel({
        admin: ANONYMOUS,
        footageId: FOOTAGE_A,
        variantId: VARIANT_A,
        body: { label: "Master" },
        store,
      }),
    ).resolves.toEqual({ status: "denied" });

    await expect(
      handleAdminUpdateOriginalVariantLabel({
        admin: ADMIN,
        footageId: FOOTAGE_B,
        variantId: VARIANT_A,
        body: { label: "Master" },
        store,
      }),
    ).resolves.toEqual({ status: "variant_not_found" });
  });

  it("does not edit a PREVIEW and preserves original metadata fields", async () => {
    const original = variant({ uploadStatus: "INITIATED" });
    const before = { ...original };
    const store = createStore([original]);
    const updateLabel = store.updateLabel;
    store.updateLabel = vi.fn(async ({ variantId }) =>
      variantId === PREVIEW_ID ? null : original,
    );

    const result = await handleAdminUpdateOriginalVariantLabel({
      admin: ADMIN,
      footageId: FOOTAGE_A,
      variantId: PREVIEW_ID,
      body: { label: "Original" },
      store,
    });

    expect(result).toEqual({ status: "variant_not_found" });
    expect(original).toMatchObject({
      id: before.id,
      label: before.label,
      footageId: before.footageId,
      sizeBytes: before.sizeBytes,
      uploadStatus: before.uploadStatus,
    });
    expect(updateLabel).not.toHaveBeenCalled();
  });
});
