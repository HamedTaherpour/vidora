import type { AdminFootageCatalogResult } from "@/modules/footage/admin/catalog/list-admin-footage-catalog";
import type { AdminFootageEditPageData } from "@/modules/footage/admin/edit/load-admin-footage-edit";
import type { AdminFootageRecord } from "@/modules/footage/admin/mutations/admin-footage-store";
import type { AdminFootagePreviewSummary } from "@/modules/media/previews/admin-footage-preview-store";
import type { AdminOriginalVariant } from "@/modules/media/originals/admin-original-variants";
import {
  selectUiMockScenario,
  type UiMockResult,
  type UiMockScenario,
} from "@/modules/ui-mock/scenarios";

const UPDATED_AT = new Date("2026-10-12T09:30:00.000Z");
const CREATED_AT = new Date("2026-09-18T08:00:00.000Z");

export const adminFootageCatalogFixture: AdminFootageCatalogResult = {
  items: [
    {
      id: "ftg-admin-001",
      titleFa: "پرواز پرندگان بر فراز کوهستان در صبح مه‌آلود",
      slug: "پرواز-پرندگان-بر-فراز-کوهستان",
      priceToman: 450_000,
      status: "PUBLISHED",
      updatedAt: UPDATED_AT,
      category: { id: "cat-nature", nameFa: "طبیعت" },
    },
    {
      id: "ftg-admin-002",
      titleFa: "پیش‌نویس نمای هوایی از بافت تاریخی شهر برای بررسی مدیر",
      slug: "پیش-نویس-بافت-تاریخی-شهر",
      priceToman: 680_000,
      status: "DRAFT",
      updatedAt: new Date("2026-10-10T11:15:00.000Z"),
      category: { id: "cat-urban", nameFa: "شهری" },
    },
  ],
  q: "",
  page: 1,
  pageSize: 10,
  totalCount: 2,
  totalPages: 1,
  emptyReason: null,
};

const adminRecord: AdminFootageRecord = {
  id: "ftg-admin-001",
  titleFa: "پرواز پرندگان بر فراز کوهستان در صبح مه‌آلود",
  slug: "پرواز-پرندگان-بر-فراز-کوهستان",
  descriptionFa:
    "نمایی آرام از پرواز پرندگان بر فراز رشته‌کوه در نور نرم صبحگاهی؛ مناسب برای مستند، تیزر و ویدئوهای طبیعت.",
  priceToman: 450_000,
  status: "PUBLISHED",
  categoryId: "cat-nature",
  tagIds: ["tag-morning", "tag-mountain", "tag-documentary"],
  publishedAt: new Date("2026-09-20T10:00:00.000Z"),
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

const adminPreview: AdminFootagePreviewSummary = {
  exists: true,
  uploadStatus: "READY",
  isReady: true,
  mimeType: "video/mp4",
};

const adminOriginalVariants: AdminOriginalVariant[] = [
  {
    id: "variant-1080p-001",
    footageId: adminRecord.id,
    label: "1080p",
    sizeBytes: 268_435_456,
    mimeType: "video/mp4",
    uploadStatus: "READY",
    width: 1920,
    height: 1080,
    fps: "25",
    codec: "H.264",
    createdAt: new Date("2026-09-20T10:30:00.000Z"),
  },
  {
    id: "variant-4k-001",
    footageId: adminRecord.id,
    label: "4K",
    sizeBytes: 1_073_741_824,
    mimeType: "video/mp4",
    uploadStatus: "INITIATED",
    width: 3840,
    height: 2160,
    fps: "25",
    codec: "H.265",
    createdAt: new Date("2026-09-21T12:00:00.000Z"),
  },
];

export const adminFootageEditFixture: AdminFootageEditPageData = {
  footage: adminRecord,
  preview: adminPreview,
  originalVariants: adminOriginalVariants,
  categories: [
    { id: "cat-nature", nameFa: "طبیعت" },
    { id: "cat-urban", nameFa: "شهری" },
  ],
  tags: [
    { id: "tag-morning", nameFa: "صبح" },
    { id: "tag-mountain", nameFa: "کوهستان" },
    { id: "tag-documentary", nameFa: "مستند" },
  ],
};

export function loadAdminFootageCatalogMock(
  scenario: UiMockScenario = "populated",
): UiMockResult<AdminFootageCatalogResult> {
  return selectUiMockScenario(scenario, {
    populated: adminFootageCatalogFixture,
    empty: {
      ...adminFootageCatalogFixture,
      items: [],
      totalCount: 0,
      totalPages: 0,
      emptyReason: "no_footage",
    },
    unavailable: null,
  });
}
