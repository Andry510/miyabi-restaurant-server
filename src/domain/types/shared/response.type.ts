import type { TPaginationFormant } from './pagination.type';

export type TMessageResponse = {
  message: string;
  timestamp: string;
};

export type TDataResponse<T> = TMessageResponse & {
  data: T;
};

export type TPaginationResponse<T> = TDataResponse<T> & {
  meta: TPaginationFormant;
};
