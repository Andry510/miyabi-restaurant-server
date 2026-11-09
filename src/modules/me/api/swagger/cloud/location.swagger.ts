//Api
import { API_ME_MESSAGE } from '../../messages';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const ME_CLOUD_LOCATION_LOCATION_DOCS: THttpDocs = {
  summary: 'Mi local',
  access: 'manager',
  cloud: true,
  success: API_ME_MESSAGE.SUCCESS.LOCATION_RETRIEVED,
};
