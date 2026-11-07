//Domain
import { DISPATCH_STATUS, ORDER_STATUS } from '@domain/enums/shared';

export const ORDER_EXPORT_SHEET = 'pedido';

export const ORDER_STATUS_LABEL: Readonly<Record<ORDER_STATUS, string>> =
  Object.freeze({
    [ORDER_STATUS.OPEN]: 'Abierto',
    [ORDER_STATUS.SENDING]: 'Enviando',
    [ORDER_STATUS.SENT]: 'Enviado',
    [ORDER_STATUS.PARTIALLY_SENT]: 'Enviado en parte',
  });

export const DISPATCH_STATUS_LABEL: Readonly<Record<DISPATCH_STATUS, string>> =
  Object.freeze({
    [DISPATCH_STATUS.PENDING]: 'Pendiente',
    [DISPATCH_STATUS.SENT]: 'Enviado',
    [DISPATCH_STATUS.FAILED]: 'Falló',
  });

export const UNIT_LABEL: Readonly<Record<string, string>> = Object.freeze({
  box: 'caja',
  piece: 'pieza',
  pack: 'paquete',
  bag: 'bolsa',
  crate: 'huacal',
  sack: 'costal',
  kg: 'kg',
  liter: 'litro',
});

export const ORDER_EXPORT_TEXT = Object.freeze({
  TITLE: 'Pedido del día',
  NOT_SENT: 'Sin enviar',
  HEADER: [
    'Código',
    'Producto',
    'Unidad',
    'Cantidad',
    'Pedido por empleados',
    'Envío',
    'Notas',
  ],
});
