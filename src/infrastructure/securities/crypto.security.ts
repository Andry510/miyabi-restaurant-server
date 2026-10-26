import { randomBytes } from 'crypto';

//Domain
import { ResultPattern } from '@domain/patterns/results';

export class Crypto {
  static generateRandomString = (length: number = 10): ResultPattern<string> =>
    ResultPattern.tryCatch('Infrastructure', Crypto.name, (): string => {
      const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
      const bytes = randomBytes(length);

      let randomString = '';

      for (let i = 0; i < length; i++) {
        randomString += chars[bytes[i] % chars.length];
      }

      return randomString;
    });
}
