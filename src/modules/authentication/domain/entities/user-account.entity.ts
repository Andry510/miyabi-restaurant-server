//Domain
import type { TUserAccountProps } from '../types/entities';

export class UserAccount {
  private readonly props: TUserAccountProps;

  private constructor(props: TUserAccountProps) {
    this.props = props;
  }

  //Create
  static register = (props: TUserAccountProps): UserAccount =>
    new UserAccount(props);

  //Get
  get UserId(): string {
    return this.props.user_id;
  }

  get Email(): string {
    return this.props.email;
  }

  get HashedPassword(): string {
    return this.props.password;
  }

  get IsActive(): boolean {
    return this.props.status && this.props.deleted_at === null;
  }

  get IsResetPassword(): boolean {
    return this.props.password_need_reset;
  }
}
