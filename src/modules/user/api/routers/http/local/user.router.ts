export const HTTP_LOCAL_USER_ROUTER = Object.freeze({
  USERS: 'users/local',
  REGISTER: 'users/local',
  USER: 'users/local/:id',
  UPDATE: 'users/local/:id',
  REMOVE: 'users/local/:id',
  PASSWORD_RESET: 'users/local/:id/password/reset',
  SESSIONS: 'users/local/:id/sessions',
  REVOKE_SESSION: 'users/local/:id/sessions',
  ATTENDANCE: 'users/local/:id/attendance',
  MY_ATTENDANCE: 'me/local/attendance',
});
