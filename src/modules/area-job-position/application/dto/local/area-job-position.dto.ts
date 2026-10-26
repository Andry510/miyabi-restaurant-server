import { ParamIdSchema } from '@domain/schemas/shared';

//Domain
import {
  JobPositionsIdsBodySchema,
  LinksQuerySchema,
  WorkAreasIdsBodySchema,
} from '../../../domain/schemas';

export class LinkParamDto {
  static schema = ParamIdSchema;
}

export class LinksQueryDto {
  static schema = LinksQuerySchema;
}

export class JobPositionsIdsBodyDto {
  static schema = JobPositionsIdsBodySchema;
}

export class WorkAreasIdsBodyDto {
  static schema = WorkAreasIdsBodySchema;
}
