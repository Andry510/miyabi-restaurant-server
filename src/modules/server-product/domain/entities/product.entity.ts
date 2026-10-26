//Domain
import type { TProductOutput, TProductProps } from '../types/entities';

export class Product {
  private readonly props: TProductProps;

  private constructor(props: TProductProps) {
    this.props = props;
  }

  //Create
  static register = (props: TProductProps): Product => new Product(props);

  //Get
  get CloudId(): string {
    return this.props.cloud_id;
  }

  get CloudUpdatedAt(): Date {
    return this.props.cloud_updated_at;
  }

  get Output(): TProductOutput {
    return { ...this.props };
  }
}
