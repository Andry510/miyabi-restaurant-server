export class JwtEntity<T> {
  private readonly payload: T;
  private readonly expiresAt: number | null;

  constructor(payload: T, expiresAt?: number) {
    this.payload = payload;
    this.expiresAt = expiresAt ?? null;
  }

  //Gets
  get IsExpired(): boolean {
    if (this.expiresAt === null) {
      return false;
    }

    return Date.now() >= this.expiresAt * 1000;
  }

  get Payload(): T {
    return this.payload;
  }
}
