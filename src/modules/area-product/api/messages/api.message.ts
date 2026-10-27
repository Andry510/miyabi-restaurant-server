export const API_AREA_PRODUCT_MESSAGE = Object.freeze({
  ERROR: {
    WORK_AREA_NOT_FOUND: {
      code: 'ERROR_AREA_PRODUCT_WORK_AREA_NOT_FOUND',
      message: 'No se encontró el área de trabajo',
    },
    PRODUCT_NOT_FOUND: {
      code: 'ERROR_AREA_PRODUCT_PRODUCT_NOT_FOUND',
      message: 'No se encontró el producto',
    },
    NOT_LINKED: {
      code: 'ERROR_AREA_PRODUCT_NOT_LINKED',
      message: 'El producto no está vinculado a esa área',
    },
  },
  SUCCESS: {
    PRODUCTS_RETRIEVED: {
      code: 'SUCCESS_AREA_PRODUCT_PRODUCTS_RETRIEVED',
      message: 'Productos del área obtenidos correctamente',
    },
    WORK_AREAS_RETRIEVED: {
      code: 'SUCCESS_AREA_PRODUCT_WORK_AREAS_RETRIEVED',
      message: 'Áreas del producto obtenidas correctamente',
    },
    LINKED: {
      code: 'SUCCESS_AREA_PRODUCT_LINKED',
      message: 'Producto vinculado al área correctamente',
    },
    UNLINKED: {
      code: 'SUCCESS_AREA_PRODUCT_UNLINKED',
      message: 'Producto desvinculado del área correctamente',
    },
  },
});
