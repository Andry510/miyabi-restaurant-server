import type { Request } from 'express';

export class ExtractHttpToken {
  static authorization = (request: Request): string | null => {
    const [type, token] = (request.headers.authorization ?? '')
      .trim()
      .split(/\s+/);

    return type?.toLowerCase() === 'bearer' && token ? token : null;
  };
}
