import {
  boolean,
  check,
  email,
  type InferOutput,
  length,
  maxLength,
  minLength,
  nonEmpty,
  optional,
  pipe,
  strictObject,
  string,
  toLowerCase,
  trim,
  uuid,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

const firstName = pipe(
  string(ERROR_MESSAGE_SCHEMA.first_name.type),
  trim(),
  minLength(2, ERROR_MESSAGE_SCHEMA.first_name.minLength),
  maxLength(100, ERROR_MESSAGE_SCHEMA.first_name.maxLength),
);

const lastName = pipe(
  string(ERROR_MESSAGE_SCHEMA.last_name.type),
  trim(),
  minLength(2, ERROR_MESSAGE_SCHEMA.last_name.minLength),
  maxLength(100, ERROR_MESSAGE_SCHEMA.last_name.maxLength),
);

const emailField = pipe(
  string(ERROR_MESSAGE_SCHEMA.email.type),
  trim(),
  nonEmpty(ERROR_MESSAGE_SCHEMA.email.nonEmpty),
  email(ERROR_MESSAGE_SCHEMA.email.email),
  toLowerCase(),
);

const phoneNumber = pipe(
  string(ERROR_MESSAGE_SCHEMA.phone_number.type),
  length(10, ERROR_MESSAGE_SCHEMA.phone_number.length),
);

const workAreaId = pipe(
  string(ERROR_MESSAGE_SCHEMA.work_area_id.type),
  uuid(ERROR_MESSAGE_SCHEMA.work_area_id.uuid),
);

const jobPositionId = pipe(
  string(ERROR_MESSAGE_SCHEMA.job_position_id.type),
  uuid(ERROR_MESSAGE_SCHEMA.job_position_id.uuid),
);

const samePair = <
  T extends { work_area_id?: string; job_position_id?: string },
>(
  input: T,
): boolean => !input.work_area_id === !input.job_position_id;

export const RegisterSchema = pipe(
  strictObject({
    first_name: firstName,
    last_name: lastName,
    email: emailField,
    password: pipe(
      string(ERROR_MESSAGE_SCHEMA.password.type),
      minLength(8, ERROR_MESSAGE_SCHEMA.password.minLength),
    ),
    phone_number: optional(phoneNumber),
    work_area_id: optional(workAreaId),
    job_position_id: optional(jobPositionId),
  }),
  check(samePair, ERROR_MESSAGE_SCHEMA.assignment.pair),
);

export type TRegisterSchema = InferOutput<typeof RegisterSchema>;

export const UpdateBodySchema = pipe(
  strictObject({
    first_name: optional(firstName),
    last_name: optional(lastName),
    email: optional(emailField),
    phone_number: optional(phoneNumber),
    status: optional(boolean(ERROR_MESSAGE_SCHEMA.status.type)),
    reset_password: optional(boolean(ERROR_MESSAGE_SCHEMA.reset_password.type)),
    work_area_id: optional(workAreaId),
    job_position_id: optional(jobPositionId),
  }),
  check(samePair, ERROR_MESSAGE_SCHEMA.assignment.pair),
);

export type TUpdateBodySchema = InferOutput<typeof UpdateBodySchema>;
