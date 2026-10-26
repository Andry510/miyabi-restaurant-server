//Domain
import type { TSessionProps } from '../../types/entities';

export class UserSession {
  private readonly props: TSessionProps;

  private constructor(props: TSessionProps) {
    this.props = props;
  }

  //Create
  static register = (props: TSessionProps): UserSession =>
    new UserSession(props);

  //Get
  get Output(): TSessionProps {
    return { ...this.props };
  }

  //Functions
  generateExpireAt(expirationMs: number): UserSession {
    this.props.expire_at = new Date(Date.now() + expirationMs);
    return this;
  }
}
