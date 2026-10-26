export const SESSION_REVOCATION_ACTOR = Object.freeze({
  SYSTEM: 'SYSTEM',
  MANAGER: 'MANAGER',
  USER: (userId: string) => userId,
});
