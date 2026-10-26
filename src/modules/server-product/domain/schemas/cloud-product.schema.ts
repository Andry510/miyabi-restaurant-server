import {
  boolean,
  enum_,
  isoTimestamp,
  nonEmpty,
  nullish,
  object,
  pipe,
  string,
  transform,
  uuid,
} from 'valibot';

//Domain
import { PRODUCT_UNIT } from '@domain/enums/shared';

const optionalTextSchema = pipe(
  nullish(string()),
  transform((value) => value || null),
);

const dateSchema = pipe(
  string(),
  isoTimestamp(),
  transform((value) => new Date(value)),
);

export const CloudProductSchema = object({
  id: pipe(string(), uuid()),
  name: pipe(string(), nonEmpty()),
  description: optionalTextSchema,
  picture: optionalTextSchema,
  barcode: optionalTextSchema,
  storage_code: pipe(string(), nonEmpty()),
  unit: enum_(PRODUCT_UNIT),
  status: boolean(),
  created_at: dateSchema,
  updated_at: dateSchema,
});

export const CloudProductRemovedSchema = object({
  id: pipe(string(), uuid()),
});
