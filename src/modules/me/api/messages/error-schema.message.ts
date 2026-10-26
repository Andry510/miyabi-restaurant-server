export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  picture: {
    type: 'La imagen debe enviarse como bytes',
    nonEmpty: 'La imagen no puede estar vacía',
    format: 'La imagen debe ser JPG, PNG o WEBP',
  },
});
