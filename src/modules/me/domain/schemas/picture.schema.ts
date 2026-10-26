import { type InferOutput, looseObject, pipe, transform } from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../api/messages';

//Domain
import { PictureBytesSchema } from '@domain/schemas/shared';

export const PictureFileSchema = pipe(
  looseObject(
    { buffer: PictureBytesSchema(ERROR_MESSAGE_SCHEMA.picture) },
    ERROR_MESSAGE_SCHEMA.picture.type,
  ),
  transform(({ buffer }) => buffer),
);

export type TPictureFileSchema = InferOutput<typeof PictureFileSchema>;
