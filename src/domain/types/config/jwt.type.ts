export type TJwtBase = {
  exp?: number;
};

export type TJwtToken = TJwtBase & {
  email: string;
  session_key: string;
};

export type TJWtRefreshToken = TJwtBase & {
  user_id: string;
  session_key: string;
};

export type TJwtPasswordToken = TJwtBase & {
  email: string;
};
