//Api
import { API_ME_MESSAGE } from '../../messages';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const ME_CLOUD_USER_USER_DOCS: THttpDocs = {
  summary: 'Mi perfil',
  access: 'manager_cloud',
  cloud: true,
  success: API_ME_MESSAGE.SUCCESS.USER_RETRIEVED,
};

export const ME_CLOUD_USER_UPLOAD_PICTURE_DOCS: THttpDocs = {
  summary: 'Subir mi foto',
  access: 'manager_cloud',
  cloud: true,
  picture: true,
  success: API_MESSAGE_GLOBAL.SUCCESS.PICTURE_UPLOADED,
};

export const ME_CLOUD_USER_REMOVE_PICTURE_DOCS: THttpDocs = {
  summary: 'Quitar mi foto',
  access: 'manager_cloud',
  cloud: true,
  success: API_MESSAGE_GLOBAL.SUCCESS.PICTURE_REMOVED,
  data: 'none',
};
