import { type InferOutput, pipe, strictObject } from 'valibot';

//Domain
import { ParamIdSchema } from '@domain/schemas/shared';

export const TransferParamSchema = pipe(
  strictObject({
    ...ParamIdSchema.entries,
  }),
);

export type TTransferParamSchema = InferOutput<typeof TransferParamSchema>;
