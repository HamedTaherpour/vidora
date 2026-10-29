export type AdminFootageCoverRecord = {
  id: string;
  footageId: string;
  objectKey: string;
  mimeType: string;
  sizeBytes: bigint;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SaveFootageCoverPersistence = {
  footageId: string;
  objectKey: string;
  mimeType: string;
  sizeBytes: bigint;
  width: number;
  height: number;
};

export type AdminFootageCoverStore = {
  findByFootageId(footageId: string): Promise<AdminFootageCoverRecord | null>;
  save(data: SaveFootageCoverPersistence): Promise<AdminFootageCoverRecord>;
};
