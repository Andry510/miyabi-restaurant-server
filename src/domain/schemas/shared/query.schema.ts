import {
  array,
  type ArraySchema,
  digits,
  type DigitsAction,
  type ErrorMessage,
  type GenericSchema,
  type InferInput,
  minValue,
  type MinValueAction,
  optional,
  type OptionalSchema,
  pipe,
  type SchemaWithPipe,
  string,
  type StringIssue,
  type StringSchema,
  transform,
  type TransformAction,
  union,
  type UnionIssue,
  type UnionSchema,
  type ArrayIssue,
  type DigitsIssue,
  type MinValueIssue,
} from 'valibot';

import { SCHEMA_MESSAGES } from '@common/messages';

type TQueryNumberSchema = SchemaWithPipe<
  readonly [
    OptionalSchema<StringSchema<ErrorMessage<StringIssue>>, string>,
    DigitsAction<string, ErrorMessage<DigitsIssue<string>>>,
    TransformAction<string, number>,
    MinValueAction<number, 1, ErrorMessage<MinValueIssue<number, 1>>>,
  ]
>;

type TQueryTextSchema = UnionSchema<
  [
    StringSchema<ErrorMessage<StringIssue>>,
    ArraySchema<
      StringSchema<ErrorMessage<StringIssue>>,
      ErrorMessage<ArrayIssue>
    >,
  ],
  ErrorMessage<UnionIssue<StringIssue | ArrayIssue>>
>;

type TQueryArraySchema<TItem extends GenericSchema> = SchemaWithPipe<
  readonly [
    OptionalSchema<TQueryTextSchema, never[]>,
    TransformAction<string | string[], Array<InferInput<TItem>>>,
    ArraySchema<TItem, ErrorMessage<ArrayIssue>>,
  ]
>;

export const PaginationQuerySchema: {
  page: TQueryNumberSchema;
  limit: TQueryNumberSchema;
} = {
  page: pipe(
    optional(string(SCHEMA_MESSAGES.ERROR.PAGINATION.PAGE_TYPE), '1'),
    digits(SCHEMA_MESSAGES.ERROR.PAGINATION.PAGE_NUMBER),
    transform(Number),
    minValue(1, SCHEMA_MESSAGES.ERROR.PAGINATION.PAGE_MIN),
  ),
  limit: pipe(
    optional(string(SCHEMA_MESSAGES.ERROR.PAGINATION.LIMIT_TYPE), '10'),
    digits(SCHEMA_MESSAGES.ERROR.PAGINATION.LIMIT_NUMBER),
    transform(Number),
    minValue(1, SCHEMA_MESSAGES.ERROR.PAGINATION.LIMIT_MIN),
  ),
};

export const queryArray = <TItem extends GenericSchema>(
  item: TItem,
  message: string,
): TQueryArraySchema<TItem> =>
  pipe(
    optional(
      union([string(message), array(string(message), message)], message),
      [],
    ),
    transform(
      (value: string | string[]) =>
        (Array.isArray(value) ? value : [value]) as Array<InferInput<TItem>>,
    ),
    array(item, message),
  );
