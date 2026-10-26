export type TCloudServerProductsInput = {
  updated_since?: string;
};

export type TCloudServerProductsOutput = {
  data: unknown[];
  removed_ids: string[];
  synced_at: Date;
};
