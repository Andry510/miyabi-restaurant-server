export type TSupplierProductOutput = {
  supplier: { id: string; full_name: string; picture: string };
  product: { id: string; name: string; picture: string; unit: string };
  price: string;
  min_order_qty: number;
  note?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export type TSupplierProductsOutput = {
  id: string;
  name: string;
  picture: string;
  status: boolean;
};

export type TProductSuppliersOutput = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  picture: string;
  status: boolean;
};
