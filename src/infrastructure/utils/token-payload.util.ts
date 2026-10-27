export class TokenPayload {
  static email = (token: string | null): string | null => {
    const encoded = token?.split('.')[1];

    if (!encoded) {
      return null;
    }

    try {
      const payload = JSON.parse(
        Buffer.from(encoded, 'base64url').toString('utf8'),
      ) as { email?: unknown };

      return typeof payload.email === 'string' ? payload.email : null;
    } catch {
      return null;
    }
  };
}
