import { pipe, strictObject } from 'valibot';

//Domain
import { ParamIdSchema } from '@domain/schemas/shared';

export const SupplierProductIdParamSchema = pipe(
  strictObject({
    ...ParamIdSchema.entries,
  }),
);
