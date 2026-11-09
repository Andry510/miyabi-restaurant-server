//Application
import { LocationsQueryDto } from '../../../application/dto';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const LOCATION_CLOUD_LOCATIONS_DOCS: THttpDocs = {
  summary: 'Listar locales de la nube',
  access: 'manager',
  cloud: true,
  query: LocationsQueryDto,
  success: API_MESSAGE_GLOBAL.SUCCESS.RETRIEVED,
  data: 'pagination',
};
