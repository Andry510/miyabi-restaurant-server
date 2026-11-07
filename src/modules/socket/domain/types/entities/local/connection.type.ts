export type TConnection =
  | { kind: 'employee'; user_id: string }
  | { kind: 'manager'; email: string; cloud_user_id: string | null };

export type TConnectionTokens = {
  access_token: string | null;
  audience: string | null;
};
