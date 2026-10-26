import {
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
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { PaginationQuerySchema, uuidList } from '@domain/schemas/shared';

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

export const JobPositionsQuerySchema = pipe(
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

export type TJobPositionsQuerySchema = InferOutput<
  typeof JobPositionsQuerySchema
>;

export const RegisterSchema = strictObject({
  name: nameField,
  description: optional(descriptionField),
  work_areas_ids: optional(uuidList(ERROR_MESSAGE_SCHEMA.work_areas_ids), []),
});

export type TRegisterSchema = InferOutput<typeof RegisterSchema>;

export const UpdateBodySchema = strictObject({
  name: optional(nameField),
  description: optional(descriptionField),
  status: optional(boolean(ERROR_MESSAGE_SCHEMA.status.type)),
});

export type TUpdateBodySchema = InferOutput<typeof UpdateBodySchema>;
