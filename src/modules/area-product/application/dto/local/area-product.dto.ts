import { ParamIdSchema } from '@domain/schemas/shared';

//Domain
import {
  LinksQuerySchema,
  ProductsIdsBodySchema,
  WorkAreasIdsBodySchema,
} from '../../../domain/schemas';

export class LinkParamDto {
  static schema = ParamIdSchema;
}

export class LinksQueryDto {
  static schema = LinksQuerySchema;
}

export class ProductsIdsBodyDto {
  static schema = ProductsIdsBodySchema;
}

export class WorkAreasIdsBodyDto {
  static schema = WorkAreasIdsBodySchema;
}
