import * as argon2 from 'argon2';

//Domain
import { ResultPattern } from '@domain/patterns/results';

export class Argon2 {
  static hash = (value: string): Promise<ResultPattern<string>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      Argon2.name,
      async () => await argon2.hash(value),
    );

  static verify = (
    hashedValue: string,
    value: string,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      Argon2.name,
      async () => await argon2.verify(hashedValue, value),
    );
}
