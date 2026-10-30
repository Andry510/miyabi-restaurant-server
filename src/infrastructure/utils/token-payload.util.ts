export class TokenPayload {
  static email = (token: string | null): string | null =>
    TokenPayload.text(token, 'email');

  static sessionKey = (token: string | null): string | null =>
    TokenPayload.text(token, 'session_key');

  static expiresAt = (token: string | null): number | null => {
    const value = TokenPayload.decode(token)?.exp;

    return typeof value === 'number' ? value : null;
  };

  //Functions
  private static text = (token: string | null, key: string): string | null => {
    const value = TokenPayload.decode(token)?.[key];

    return typeof value === 'string' ? value : null;
  };

  private static decode = (
    token: string | null,
  ): Record<string, unknown> | null => {
    const encoded = token?.split('.')[1];

    if (!encoded) {
      return null;
    }

    try {
      return JSON.parse(
        Buffer.from(encoded, 'base64url').toString('utf8'),
      ) as Record<string, unknown>;
    } catch {
      return null;
    }
  };
}
