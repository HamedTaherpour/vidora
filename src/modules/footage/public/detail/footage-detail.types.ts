import type { ComponentType } from "react";
import type { PublicFootageDetail } from "../catalog/public-footage-detail-store";
import type { HomeCategory } from "../home-exploration/home-page.types";

export type FootageDetailPageProps = {
  footage: PublicFootageDetail;
  related: PublicFootageDetail[];
  categories: HomeCategory[];
  session: "anonymous" | "authenticated";
};

export type FootageVideoPreviewProps = {
  footage: Pick<PublicFootageDetail, "titleFa" | "cover" | "preview">;
};

export type DetailValueProps = {
  label: string;
  value?: string;
  icon: ComponentType<{ className?: string }>;
};
