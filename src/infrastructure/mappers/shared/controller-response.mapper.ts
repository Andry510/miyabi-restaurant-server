import type {
  TApiMessage,
  TDataResponse,
  TMessageResponse,
  TPaginationFormant,
  TPaginationResponse,
} from '@domain/types/shared';

const toIso = <T>(value: T): T => {
  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item: unknown) => toIso(item)) as T;
  }

  if (value && typeof value === 'object' && !ArrayBuffer.isView(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, toIso(item)]),
    ) as T;
  }

  return value;
};

export class ControllerResponseMapper {
  static toMessageResult = ({
    code,
    message,
  }: TApiMessage): TMessageResponse => ({
    code,
    message,
    timestamp: new Date().toISOString(),
  });

  static toDataResult = <T>(
    { code, message }: TApiMessage,
    data: T,
  ): TDataResponse<T> => ({
    code,
    message,
    data: toIso(data),
    timestamp: new Date().toISOString(),
  });

  static toPaginationResult = <T>(
    { code, message }: TApiMessage,
    data: T,
    meta: TPaginationFormant,
  ): TPaginationResponse<T> => ({
    code,
    message,
    data: toIso(data),
    meta,
    timestamp: new Date().toISOString(),
  });
}
