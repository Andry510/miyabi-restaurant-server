import {
  array,
  check,
  enum_,
  type InferOutput,
  isoDate,
  maxLength,
  maxValue,
  minValue,
  number,
  optional,
  pipe,
  strictObject,
  string,
  transform,
  trim,
  uuid,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { TIP_POOL_STATUS, TIP_SPLIT_METHOD } from '@domain/enums/shared';
import {
  DateRangeQuerySchema,
  dateRange,
  PaginationQuerySchema,
  ParamIdSchema,
} from '@domain/schemas/shared';

const hasTwoDecimals = (value: number): boolean =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

const isUnique = (values: string[]): boolean =>
  new Set(values).size === values.length;

const MAX_AMOUNT = 9_999_999.99;

const percentageField = pipe(
  number(ERROR_MESSAGE_SCHEMA.percentage.type),
  check(hasTwoDecimals, ERROR_MESSAGE_SCHEMA.percentage.decimals),
  minValue(0.01, ERROR_MESSAGE_SCHEMA.percentage.range),
  maxValue(100, ERROR_MESSAGE_SCHEMA.percentage.range),
);

const weightField = pipe(
  number(ERROR_MESSAGE_SCHEMA.weight.type),
  check(hasTwoDecimals, ERROR_MESSAGE_SCHEMA.weight.decimals),
  minValue(0.01, ERROR_MESSAGE_SCHEMA.weight.range),
  maxValue(10, ERROR_MESSAGE_SCHEMA.weight.range),
);

const amountField = pipe(
  number(ERROR_MESSAGE_SCHEMA.amount.type),
  check(hasTwoDecimals, ERROR_MESSAGE_SCHEMA.amount.decimals),
  minValue(0.01, ERROR_MESSAGE_SCHEMA.amount.range),
  maxValue(MAX_AMOUNT, ERROR_MESSAGE_SCHEMA.amount.range),
);

const allocationAmountField = pipe(
  number(ERROR_MESSAGE_SCHEMA.amount.type),
  check(hasTwoDecimals, ERROR_MESSAGE_SCHEMA.amount.decimals),
  minValue(0, ERROR_MESSAGE_SCHEMA.amount.range),
  maxValue(MAX_AMOUNT, ERROR_MESSAGE_SCHEMA.amount.range),
);

const workAreaIdField = pipe(
  string(ERROR_MESSAGE_SCHEMA.work_area_id.type),
  uuid(ERROR_MESSAGE_SCHEMA.work_area_id.uuid),
);

const noteField = pipe(
  string(ERROR_MESSAGE_SCHEMA.note.type),
  trim(),
  maxLength(500, ERROR_MESSAGE_SCHEMA.note.maxLength),
);

export const RulesBodySchema = pipe(
  strictObject({
    rules: array(
      strictObject({
        work_area_id: workAreaIdField,
        percentage: percentageField,
        method: enum_(TIP_SPLIT_METHOD, ERROR_MESSAGE_SCHEMA.method.enum),
        weights: optional(
          pipe(
            array(
              strictObject({
                job_position_id: pipe(
                  string(ERROR_MESSAGE_SCHEMA.job_position_id.type),
                  uuid(ERROR_MESSAGE_SCHEMA.job_position_id.uuid),
                ),
                weight: weightField,
              }),
              ERROR_MESSAGE_SCHEMA.weights.type,
            ),
            check(
              (weights) =>
                isUnique(weights.map((item) => item.job_position_id)),
              ERROR_MESSAGE_SCHEMA.weights.duplicated,
            ),
          ),
          [],
        ),
      }),
      ERROR_MESSAGE_SCHEMA.rules.type,
    ),
  }),
  check(
    ({ rules }) => isUnique(rules.map((rule) => rule.work_area_id)),
    ERROR_MESSAGE_SCHEMA.rules.duplicated,
  ),
  check(
    ({ rules }) =>
      rules.length === 0 ||
      rules.reduce(
        (total, rule) => total + Math.round(rule.percentage * 100),
        0,
      ) === 10_000,
    ERROR_MESSAGE_SCHEMA.rules.total,
  ),
);

export type TRulesBodySchema = InferOutput<typeof RulesBodySchema>;

export const RegisterSchema = strictObject({
  date: pipe(
    string(ERROR_MESSAGE_SCHEMA.date.type),
    isoDate(ERROR_MESSAGE_SCHEMA.date.format),
  ),
  work_schedule_id: optional(
    pipe(
      string(ERROR_MESSAGE_SCHEMA.work_schedule_id.type),
      uuid(ERROR_MESSAGE_SCHEMA.work_schedule_id.uuid),
    ),
  ),
  amount: amountField,
  note: optional(noteField),
});

export type TRegisterSchema = InferOutput<typeof RegisterSchema>;

export const UpdateBodySchema = strictObject({
  amount: optional(amountField),
  note: optional(noteField),
});

export type TUpdateBodySchema = InferOutput<typeof UpdateBodySchema>;

export const AreaBodySchema = strictObject({
  allocations: pipe(
    array(
      strictObject({
        user_id: pipe(
          string(ERROR_MESSAGE_SCHEMA.user_id.type),
          uuid(ERROR_MESSAGE_SCHEMA.user_id.uuid),
        ),
        amount: allocationAmountField,
      }),
      ERROR_MESSAGE_SCHEMA.allocations.type,
    ),
    check(
      (allocations) => isUnique(allocations.map((item) => item.user_id)),
      ERROR_MESSAGE_SCHEMA.allocations.duplicated,
    ),
  ),
});

export type TAreaBodySchema = InferOutput<typeof AreaBodySchema>;

export const AreaParamSchema = strictObject({
  ...ParamIdSchema.entries,
  work_area_id: workAreaIdField,
});

export type TAreaParamSchema = InferOutput<typeof AreaParamSchema>;

export const PoolsQuerySchema = pipe(
  strictObject({
    ...PaginationQuerySchema,
    ...DateRangeQuerySchema,
    status: optional(enum_(TIP_POOL_STATUS, ERROR_MESSAGE_SCHEMA.status.enum)),
  }),
  dateRange(),
  transform(({ limit, page, ...rest }) => ({
    ...rest,
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  })),
);

export type TPoolsQuerySchema = InferOutput<typeof PoolsQuerySchema>;

export const MyTipsQuerySchema = pipe(
  strictObject({ ...DateRangeQuerySchema }),
  dateRange(),
);

export type TMyTipsQuerySchema = InferOutput<typeof MyTipsQuerySchema>;
