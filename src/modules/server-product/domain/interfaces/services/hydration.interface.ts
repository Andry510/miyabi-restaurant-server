export interface IHydrationService {
  hydrate(): Promise<void>;

  save(payload: unknown): Promise<void>;

  remove(payload: unknown): Promise<void>;
}
