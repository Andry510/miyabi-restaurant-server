export type TProductOutput = {
  id: string;
  name: string;
  description: string;
  status: boolean;
  picture: string;
  barcode: string;
  storage_code: string;
  unit: string;
  created_at: string;
  updated_at: string;
};

export type TProductsOutput = Pick<
  TProductOutput,
  'id' | 'name' | 'picture' | 'status' | 'unit'
>;

export type TLocalProductOutput = {
  id: string;
  name: string;
  picture: string | null;
  barcode: string | null;
  storage_code: string;
  unit: string;
};
