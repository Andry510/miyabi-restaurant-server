import { type InferOutput, pipe, strictObject } from 'valibot';

//Domain
import { ParamIdSchema } from '@domain/schemas/shared';

export const SupplierParamSchema = pipe(
  strictObject({
    ...ParamIdSchema.entries,
  }),
);

export type TSupplierParamSchema = InferOutput<typeof SupplierParamSchema>;
