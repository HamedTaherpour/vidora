export type FootageMediaCover =
  | { status: "ready"; src: string; altFa: string }
  | { status: "unavailable"; altFa: string };

export type FootageMediaPreviewProps = {
  cover: FootageMediaCover;
  previewUrl?: string;
  mode?: "hover" | "controls";
};
