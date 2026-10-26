type TDecimalLike = { toString(): string } | number | string;

export class Money {
  static toCents = (value: TDecimalLike): number =>
    Math.round(Number(value.toString()) * 100);

  static fromCents = (cents: number): number => cents / 100;

  static toDecimal = (cents: number): string => (cents / 100).toFixed(2);
}
