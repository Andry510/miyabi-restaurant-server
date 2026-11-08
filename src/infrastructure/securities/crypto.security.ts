import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

//Domain
import { ResultPattern } from '@domain/patterns/results';

//Infrastructure
import { Env } from '@infrastructure/config';

const CIPHER_ALGORITHM = 'aes-256-gcm';
const CIPHER_IV_BYTES = 12;
const CIPHER_TAG_BYTES = 16;

const encryptionKey = (): Buffer =>
  Buffer.from(Env.DATA_ENCRYPTION_KEY, 'base64');

export class Crypto {
  static sha256 = (value: string): string =>
    createHash('sha256').update(value).digest('hex');

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

  static encrypt = (value: string): ResultPattern<string> =>
    ResultPattern.tryCatch('Infrastructure', Crypto.name, (): string => {
      const iv = randomBytes(CIPHER_IV_BYTES);
      const cipher = createCipheriv(CIPHER_ALGORITHM, encryptionKey(), iv);
      const encrypted = Buffer.concat([
        cipher.update(value, 'utf8'),
        cipher.final(),
      ]);

      return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
        'base64',
      );
    });

  static decrypt = (value: string): ResultPattern<string> =>
    ResultPattern.tryCatch('Infrastructure', Crypto.name, (): string => {
      const data = Buffer.from(value, 'base64');
      const iv = data.subarray(0, CIPHER_IV_BYTES);
      const tag = data.subarray(
        CIPHER_IV_BYTES,
        CIPHER_IV_BYTES + CIPHER_TAG_BYTES,
      );
      const decipher = createDecipheriv(CIPHER_ALGORITHM, encryptionKey(), iv);
      decipher.setAuthTag(tag);

      return Buffer.concat([
        decipher.update(data.subarray(CIPHER_IV_BYTES + CIPHER_TAG_BYTES)),
        decipher.final(),
      ]).toString('utf8');
    });
}
