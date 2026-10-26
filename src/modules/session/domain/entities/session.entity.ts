//Domain
import { SESSION_STATUS } from '@domain/enums/shared';
import type { TSessionProps } from '../types/entities';

export class UserSession {
  private readonly id: string;

  private secret_key: string;
  private refresh_token_hash: string;
  private status: SESSION_STATUS;

  private readonly user_id: string;
  private requester_ip: string | null;
  private device: string | null;
  private browser: string | null;
  private revoked_by: string | null;

  private expire_at: Date | null;
  private revoked_at: Date | null;

  private constructor(props: TSessionProps) {
    this.id = props.id;
    this.secret_key = props.secret_key;
    this.refresh_token_hash = props.refresh_token_hash;
    this.status = props.status;
    this.user_id = props.user_id;
    this.requester_ip = props.requester_ip;
    this.device = props.device;
    this.browser = props.browser;
    this.revoked_by = props.revoked_by;
    this.expire_at = props.expire_at;
    this.revoked_at = props.revoked_at;
  }

  //Creates
  static register = (props: TSessionProps): UserSession =>
    new UserSession(props);

  //Gets
  get Id(): string {
    return this.id;
  }

  get SecretKey(): string {
    return this.secret_key;
  }

  get RefreshTokenHash(): string {
    return this.refresh_token_hash;
  }

  get Status(): SESSION_STATUS {
    return this.status;
  }

  get UserId(): string {
    return this.user_id;
  }

  get RequesterIp(): string | null {
    return this.requester_ip;
  }

  get Device(): string | null {
    return this.device;
  }

  get Browser(): string | null {
    return this.browser;
  }

  get RevokedBy(): string | null {
    return this.revoked_by;
  }

  get RevokedAt(): Date | null {
    return this.revoked_at;
  }

  get ExpireAt(): Date | null {
    return this.expire_at;
  }

  get IsExpired(): boolean {
    return this.expire_at === null || this.expire_at <= new Date();
  }

  willExpireWithin(hours: number): boolean {
    if (!this.expire_at) {
      return false;
    }

    const now = new Date();
    const expiresAt = new Date(this.expire_at);
    const diffMs = expiresAt.getTime() - now.getTime();
    const remainingHours = diffMs / (1000 * 60 * 60);

    return remainingHours > 0 && remainingHours <= hours;
  }

  setRefreshTokenHash(token: string): UserSession {
    this.refresh_token_hash = token;
    return this;
  }

  setRequesterIp(ip: string): UserSession {
    this.requester_ip = ip;
    return this;
  }

  expire(): UserSession {
    this.status = SESSION_STATUS.EXPIRED;
    return this;
  }

  revoke(revokedBy: string): UserSession {
    this.revoked_by = revokedBy;
    this.revoked_at = new Date();
    this.status = SESSION_STATUS.REVOKED;
    return this;
  }

  renewExpiration(expirationMs: number): UserSession {
    this.expire_at = new Date(Date.now() + expirationMs);
    return this;
  }
}
