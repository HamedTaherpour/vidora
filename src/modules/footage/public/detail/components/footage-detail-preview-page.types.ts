import type { PublicFootageDetail } from "../public-footage-detail.types";

/** Props for the public Footage detail composition. */
export type FootageDetailPageProps = {
  footage: PublicFootageDetail;
};

/** Props for the semantic title and summary block. */
export type FootageTitleProps = {
  footage: PublicFootageDetail;
};

/** Props for the public technical metadata block. */
export type FootageMetadataProps = {
  footage: PublicFootageDetail;
};
