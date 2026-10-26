//Domain
import type { TUserDetail } from '@domain/types/entities';

export class UserAggregate {
  private readonly detail: TUserDetail;

  private constructor(detail: TUserDetail) {
    this.detail = detail;
  }

  //Create
  static register = (detail: TUserDetail): UserAggregate =>
    new UserAggregate(detail);

  //Get
  get IsActive(): boolean {
    return this.detail.status;
  }

  get UserDetail(): TUserDetail {
    return { ...this.detail };
  }
}
