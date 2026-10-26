export type TAreaProductOutput = {
  id: string;
  name: string;
  picture: string | null;
  barcode: string | null;
  storage_code: string;
  unit: string;
  status: boolean;
};

export type TProductAreaOutput = {
  id: string;
  name: string;
  description: string | null;
  status: boolean;
};
