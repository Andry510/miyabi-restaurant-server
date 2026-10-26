export const HTTP_CLOUD_SUPPLIER_PRODUCT_ROUTER = Object.freeze({
  LINK: {
    DETAIL: 'suppliers/cloud/:supplier_id/products/:product_id',
  },
  SUPPLIER: {
    PRODUCTS: 'suppliers/cloud/:id/products',
  },
  PRODUCT: {
    SUPPLIERS: 'products/cloud/:id/suppliers',
  },
});
