export type TManagerSession = {
  id: string;
  email: string;
  cloud_session_key: string;
  access_token: string;
};

export type TManagerSessionRow = {
  id: string;
  email: string;
  cloud_session_key: string;
  access_token_enc: string;
  refresh_token_enc: string;
  access_expires_at: Date;
  last_access_at: Date;
  requester_ip: string | null;
  device: string | null;
  browser: string | null;
};

export type TCreateManagerSessionInput = Omit<
  TManagerSessionRow,
  'id' | 'last_access_at'
> & {
  token_hash: string;
};

export type TManagerSessionTokens = Pick<
  TManagerSessionRow,
  | 'cloud_session_key'
  | 'access_token_enc'
  | 'refresh_token_enc'
  | 'access_expires_at'
>;

export type TSessionClosedHandler = (
  sessionIds: string[],
) => Promise<void> | void;

export type TSessionAccess = {
  session_token: string;
};

export type TWithSession<T> = Omit<T, 'access'> & {
  [K in keyof Pick<T, 'access' & keyof T>]: TSessionAccess;
};
