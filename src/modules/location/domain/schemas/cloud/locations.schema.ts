import {
  enum_,
  type InferOutput,
  optional,
  strictObject,
  string,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { LOCATION_TYPE } from '@domain/enums/shared';
import { PaginationQuerySchema } from '@domain/schemas/shared';

export const LocationsQuerySchema = strictObject({
  ...PaginationQuerySchema,
  name: optional(string(ERROR_MESSAGE_SCHEMA.name.type)),
  phone_number: optional(string(ERROR_MESSAGE_SCHEMA.phone_number.type)),
  type: optional(enum_(LOCATION_TYPE, ERROR_MESSAGE_SCHEMA.type.enum)),
});

export type TLocationsQuerySchema = InferOutput<typeof LocationsQuerySchema>;
