import { Prisma } from '@generated/prisma/client';

export class PrismaError {
  static is = (error: unknown, code: string): boolean =>
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === code;
}
