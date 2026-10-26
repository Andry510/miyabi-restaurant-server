export type TRequireMfa = {
  mfa_required: boolean;
  mfa_reset_required: boolean;
  mfa_token: string;
};

export type TRequirePassword = {
  password_reset_required: boolean;
  password_reset_token: string;
};

export type TAuthenticationComplete = {
  access_token: string;
  refresh_token: string;
};

export type TLoginOutput = {
  mfa?: TRequireMfa;
  password?: TRequirePassword;
  access?: TAuthenticationComplete;
};

export type TMfaCodeOutput = {
  password?: TRequirePassword;
  access?: TAuthenticationComplete;
};

export type TResetPasswordOutput = {
  access: TAuthenticationComplete;
};
