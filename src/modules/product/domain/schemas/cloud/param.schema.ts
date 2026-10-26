import { type InferOutput, pipe, strictObject } from 'valibot';

//Domain
import { ParamIdSchema } from '@domain/schemas/shared';

export const ProductParamSchema = pipe(
  strictObject({
    ...ParamIdSchema.entries,
  }),
);

export type TProductParamSchema = InferOutput<typeof ProductParamSchema>;
