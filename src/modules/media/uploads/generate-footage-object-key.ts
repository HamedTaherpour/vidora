import { randomUUID } from "node:crypto";

export type FootageObjectKeyKind = "PREVIEW" | "ORIGINAL";

type GenerateFootageObjectKeyParams = {
  footageId: string;
  kind: FootageObjectKeyKind;
  fileName?: string | null;
  createId?: () => string;
};

/**
 * Server-controlled object key. The browser must never choose an arbitrary key.
 * Keys are operational identifiers, not authorization secrets.
 */
export function generateFootageObjectKey({
  footageId,
  kind,
  fileName = null,
  createId = randomUUID,
}: GenerateFootageObjectKeyParams): string {
  const folder = kind === "PREVIEW" ? "preview" : "originals";
  const extension = safeFileExtension(fileName);
  const name = `${createId()}${extension}`;

  return `footage/${footageId}/${folder}/${name}`;
}

function safeFileExtension(fileName: string | null | undefined): string {
  if (fileName === null || fileName === undefined) {
    return "";
  }

  const base = fileName.split(/[/\\]/).pop() ?? "";
  const match = /\.([A-Za-z0-9]{1,16})$/.exec(base);

  if (match === null) {
    return "";
  }

  const extension = match[1];
  return extension === undefined ? "" : `.${extension.toLowerCase()}`;
}
