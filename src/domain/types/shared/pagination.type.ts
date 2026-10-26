export type TPaginationFormant = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  next_page: boolean;
  prev_page: boolean;
};

export type TPaginationRepository<T> = {
  data: T[];
  count: number;
};

export type TPaginationService<T> = {
  data: T[];
  metadata: TPaginationFormant;
};
