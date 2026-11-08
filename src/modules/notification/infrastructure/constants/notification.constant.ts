//Domain
import { INCIDENT_TYPE } from '@domain/enums/shared';
import type { TNotificationTemplate } from '../../domain/types/entities';

export const NOTIFICATION_TEMPLATE = Object.freeze({
  SHIFT_SCHEDULED: 'SHIFT_SCHEDULED',
  SHIFT_CHANGED: 'SHIFT_CHANGED',
  SHIFT_CANCELLED: 'SHIFT_CANCELLED',
  ATTENDANCE_CORRECTED: 'ATTENDANCE_CORRECTED',
  INCIDENT_JUSTIFIED: 'INCIDENT_JUSTIFIED',
  TIP_POOL_CLOSED: 'TIP_POOL_CLOSED',
  TIP_SANCTION_APPLIED: 'TIP_SANCTION_APPLIED',
  ORDER_REQUEST_SUBMITTED: 'ORDER_REQUEST_SUBMITTED',
  ATTENDANCE_LATE: 'ATTENDANCE_LATE',
  ORDER_DISPATCH_FAILED: 'ORDER_DISPATCH_FAILED',
  ORDER_DISPATCH_PENDING: 'ORDER_DISPATCH_PENDING',
  SERVER_UNLINKED: 'SERVER_UNLINKED',
} as const);

export const NOTIFICATION_ENTITY = Object.freeze({
  SHIFT: 'shift',
  TIP_POOL: 'tip_pool',
  ORDER: 'order',
} as const);

export const NOTIFICATION_AUDIENCE = Object.freeze({
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
} as const);

export const NOTIFICATION_INCIDENT_LABEL: Readonly<
  Record<INCIDENT_TYPE, string>
> = Object.freeze({
  [INCIDENT_TYPE.LATE_ARRIVAL]: 'retardo',
  [INCIDENT_TYPE.EARLY_DEPARTURE]: 'salida anticipada',
  [INCIDENT_TYPE.LATE_DEPARTURE]: 'salida tarde',
  [INCIDENT_TYPE.ABSENCE]: 'falta',
  [INCIDENT_TYPE.MISSED_CLOCK_IN]: 'entrada sin registrar',
  [INCIDENT_TYPE.MISSED_CLOCK_OUT]: 'salida sin registrar',
});

export const NOTIFICATION_TEMPLATES: readonly TNotificationTemplate[] =
  Object.freeze([
    {
      code: NOTIFICATION_TEMPLATE.SHIFT_SCHEDULED,
      category: 'shift',
      audience: NOTIFICATION_AUDIENCE.EMPLOYEE,
      title: 'Turnos nuevos',
      body: 'Te programaron {{count}} turno(s); el primero es el {{start}}',
    },
    {
      code: NOTIFICATION_TEMPLATE.SHIFT_CHANGED,
      category: 'shift',
      audience: NOTIFICATION_AUDIENCE.EMPLOYEE,
      title: 'Turno modificado',
      body: 'Tu turno ahora es del {{start}} al {{end}}',
    },
    {
      code: NOTIFICATION_TEMPLATE.SHIFT_CANCELLED,
      category: 'shift',
      audience: NOTIFICATION_AUDIENCE.EMPLOYEE,
      title: 'Turno cancelado',
      body: 'Se canceló tu turno del {{start}}',
    },
    {
      code: NOTIFICATION_TEMPLATE.ATTENDANCE_CORRECTED,
      category: 'attendance',
      audience: NOTIFICATION_AUDIENCE.EMPLOYEE,
      title: 'Asistencia corregida',
      body: 'Se corrigió tu asistencia del turno del {{start}}: {{reason}}',
    },
    {
      code: NOTIFICATION_TEMPLATE.INCIDENT_JUSTIFIED,
      category: 'attendance',
      audience: NOTIFICATION_AUDIENCE.EMPLOYEE,
      title: 'Incidencia justificada',
      body: 'Se justificó tu {{incident}} del turno del {{start}}',
    },
    {
      code: NOTIFICATION_TEMPLATE.TIP_POOL_CLOSED,
      category: 'tip',
      audience: NOTIFICATION_AUDIENCE.EMPLOYEE,
      title: 'Propinas listas',
      body: 'Te tocaron ${{amount}} de las propinas del {{from}} al {{to}}',
    },
    {
      code: NOTIFICATION_TEMPLATE.TIP_SANCTION_APPLIED,
      category: 'tip',
      audience: NOTIFICATION_AUDIENCE.EMPLOYEE,
      title: 'Sanción en propinas',
      body: 'Se te aplicó la sanción {{sanction}} en las propinas del {{from}} al {{to}}',
    },
    {
      code: NOTIFICATION_TEMPLATE.ORDER_REQUEST_SUBMITTED,
      category: 'order',
      audience: NOTIFICATION_AUDIENCE.MANAGER,
      title: 'Nueva solicitud',
      body: '{{employee}} ({{area}}) pidió {{quantity}} de {{product}}',
    },
    {
      code: NOTIFICATION_TEMPLATE.ATTENDANCE_LATE,
      category: 'attendance',
      audience: NOTIFICATION_AUDIENCE.MANAGER,
      title: 'Retardo',
      body: '{{employee}} llegó {{minutes}} min tarde a su turno del {{start}}',
    },
    {
      code: NOTIFICATION_TEMPLATE.ORDER_DISPATCH_FAILED,
      category: 'order',
      audience: NOTIFICATION_AUDIENCE.MANAGER,
      title: 'Envío fallido',
      body: 'No se pudieron enviar {{count}} pedido(s) a la nube; reinténtalo',
    },
    {
      code: NOTIFICATION_TEMPLATE.ORDER_DISPATCH_PENDING,
      category: 'order',
      audience: NOTIFICATION_AUDIENCE.MANAGER,
      title: 'Pedidos sin enviar',
      body: 'Volvió la conexión con la nube y hay {{count}} pedido(s) sin enviar; reinténtalos',
    },
    {
      code: NOTIFICATION_TEMPLATE.SERVER_UNLINKED,
      category: 'server',
      audience: NOTIFICATION_AUDIENCE.MANAGER,
      title: 'Servidor desvinculado',
      body: 'La nube desvinculó este servidor ({{reason}}); pide al administrador un token nuevo para volver a conectarlo',
    },
  ]);

export const NOTIFICATION_LIMITS = Object.freeze({
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  CURSOR_MAX_LENGTH: 200,
  RETENTION_DAYS: 90,
  CLEANUP_INTERVAL_MS: 24 * 60 * 60_000,
});
