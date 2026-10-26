import {
  array,
  boolean,
  type InferOutput,
  maxLength,
  minLength,
  optional,
  pipe,
  strictObject,
  string,
  transform,
  trim,
  uuid,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../api/messages';

//Domain
import { PaginationQuerySchema } from '@domain/schemas/shared';

const nameField = pipe(
  string(ERROR_MESSAGE_SCHEMA.name.type),
  trim(),
  minLength(2, ERROR_MESSAGE_SCHEMA.name.minLength),
  maxLength(100, ERROR_MESSAGE_SCHEMA.name.maxLength),
);

const descriptionField = pipe(
  string(ERROR_MESSAGE_SCHEMA.description.type),
  trim(),
  maxLength(255, ERROR_MESSAGE_SCHEMA.description.maxLength),
);

export const WorkAreasQuerySchema = pipe(
  strictObject({
    ...PaginationQuerySchema,
    name: optional(string(ERROR_MESSAGE_SCHEMA.name.type)),
  }),
  transform(({ limit, page, ...rest }) => ({
    ...rest,
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  })),
);

export type TWorkAreasQuerySchema = InferOutput<typeof WorkAreasQuerySchema>;

export const RegisterSchema = strictObject({
  name: nameField,
  description: optional(descriptionField),
  job_positions_ids: optional(
    pipe(
      array(
        pipe(
          string(ERROR_MESSAGE_SCHEMA.job_positions_ids.itemType),
          uuid(ERROR_MESSAGE_SCHEMA.job_positions_ids.itemUuid),
        ),
        ERROR_MESSAGE_SCHEMA.job_positions_ids.type,
      ),
      transform((ids) => [...new Set(ids)]),
    ),
    [],
  ),
});

export type TRegisterSchema = InferOutput<typeof RegisterSchema>;

export const UpdateBodySchema = strictObject({
  name: optional(nameField),
  description: optional(descriptionField),
  status: optional(boolean(ERROR_MESSAGE_SCHEMA.status.type)),
});

export type TUpdateBodySchema = InferOutput<typeof UpdateBodySchema>;
