//Domain
import { UserSession } from '../../entities';
import type { TSessionProps } from '../../types/entities';

export class SessionAggregate {
  private readonly session: UserSession;
  private readonly email: string;

  private constructor(session: UserSession, email: string) {
    this.session = session;
    this.email = email;
  }

  //Create
  static register = (session: TSessionProps, email: string): SessionAggregate =>
    new SessionAggregate(UserSession.register(session), email);

  get UserId(): string {
    return this.session.UserId;
  }

  get Email(): string {
    return this.email;
  }

  get SecretKey(): string {
    return this.session.SecretKey;
  }

  get RefreshTokenHash(): string {
    return this.session.RefreshTokenHash;
  }

  get IsExpired(): boolean {
    return this.session.IsExpired;
  }

  get Session(): UserSession {
    return this.session;
  }

  get WillExpireWithin24Hours(): boolean {
    return this.session.willExpireWithin(24);
  }

  verifyRequesterIp = (ip: string): boolean => this.session.RequesterIp === ip;

  verifyBrowser = (browser: string): boolean =>
    this.session.Browser === browser;

  verifyDevice = (device: string): boolean => this.session.Device === device;

  expire(): SessionAggregate {
    this.session.expire();
    return this;
  }

  revoke(revokeBy: string): SessionAggregate {
    this.session.revoke(revokeBy);
    return this;
  }

  setRefreshTokenHash(token: string): SessionAggregate {
    this.session.setRefreshTokenHash(token);
    return this;
  }

  setRequestIp(ip: string): SessionAggregate {
    this.session.setRequesterIp(ip);
    return this;
  }

  renewExpiration(expirationMs: number): SessionAggregate {
    this.session.renewExpiration(expirationMs);
    return this;
  }
}
