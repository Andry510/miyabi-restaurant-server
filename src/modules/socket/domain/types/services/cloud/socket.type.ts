export type TSocketHandler = (payload: unknown) => Promise<void> | void;

export type TSocketConnectError = Error & { data?: { code?: number } };
