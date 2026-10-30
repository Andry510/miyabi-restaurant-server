//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';

//Infrastructure
import type {
  CHANNEL_EVENT,
  CHANNEL_REQUEST,
} from '../../../../infrastructure/constants';

export type TChannelEvent = (typeof CHANNEL_EVENT)[keyof typeof CHANNEL_EVENT];

export type TChannelRequest =
  (typeof CHANNEL_REQUEST)[keyof typeof CHANNEL_REQUEST];

export type TChannelHandler = (payload: unknown) => Promise<void> | void;

export type TServerStatus = {
  version: string;
  uptime_seconds: number;
  database_ok: boolean;
  products_synced_at?: string;
  pending_dispatches: number;
  failed_dispatches: number;
};

export type TAttendanceRecordMessage = {
  user_id: string;
  first_name: string;
  last_name: string;
  date: string;
  scheduled_start: string;
  scheduled_end: string;
  clock_in?: string;
  clock_out?: string;
  status: string;
  late_minutes?: number;
  early_departure_minutes?: number;
  incidents: string[];
};

export type TServerMessageBody = {
  attendance?: { records: TAttendanceRecordMessage[] };
};

export type TServerMessage = TServerMessageBody & {
  request_id?: string;
  status?: TServerStatus;
  error?: { code: string; message: string };
};

export type TCloudMessage = Partial<Record<TChannelEvent, unknown>> & {
  message_id?: string;
  sent_at?: string;
  request_id?: string;
  sync_required?: object;
  session_expired?: { reason?: string };
  attendance_request?: { from?: string; to?: string };
};

export type TChannelRequestHandler = (
  params: unknown,
) => Promise<ResultPattern<TServerMessageBody, ServiceError>>;

export type TStatusSnapshot = {
  products_synced_at: Date | null;
  pending_dispatches: number;
  failed_dispatches: number;
};
