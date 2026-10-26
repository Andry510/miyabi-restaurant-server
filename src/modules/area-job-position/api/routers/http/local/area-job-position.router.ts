export const HTTP_LOCAL_AREA_JOB_POSITION_ROUTER = Object.freeze({
  WORK_AREA: {
    JOB_POSITIONS: 'work-areas/local/:id/job-positions',
    ASSIGN: 'work-areas/local/:id/job-positions',
    REMOVE: 'work-areas/local/:id/job-positions',
    USERS: 'work-areas/local/:id/users',
  },
  JOB_POSITION: {
    WORK_AREAS: 'job-positions/local/:id/work-areas',
    ASSIGN: 'job-positions/local/:id/work-areas',
    REMOVE: 'job-positions/local/:id/work-areas',
    USERS: 'job-positions/local/:id/users',
  },
});
