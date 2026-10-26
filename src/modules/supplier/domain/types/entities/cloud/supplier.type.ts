export type TSupplierOutput = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  picture?: string;
};

export type TSuppliersOutput = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  picture: string;
  status: boolean;
};
