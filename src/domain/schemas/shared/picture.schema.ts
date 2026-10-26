import {
  type CheckAction,
  check,
  custom,
  type CustomIssue,
  type CustomSchema,
  type ErrorMessage,
  pipe,
  type SchemaWithPipe,
} from 'valibot';

type TPictureBytesSchema = SchemaWithPipe<
  readonly [
    CustomSchema<Uint8Array, ErrorMessage<CustomIssue> | undefined>,
    CheckAction<Uint8Array, string>,
    CheckAction<Uint8Array, string>,
  ]
>;

type TPictureMessages = {
  type: string;
  nonEmpty: string;
  format: string;
};

const startsWith = (
  bytes: Uint8Array,
  signature: number[],
  offset = 0,
): boolean => signature.every((byte, index) => bytes[offset + index] === byte);

const JPEG = [0xff, 0xd8, 0xff];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];

export const isImageBytes = (bytes: Uint8Array): boolean =>
  startsWith(bytes, JPEG) ||
  startsWith(bytes, PNG) ||
  (startsWith(bytes, RIFF) && startsWith(bytes, WEBP, 8));

export const PictureBytesSchema = (
  messages: TPictureMessages,
): TPictureBytesSchema =>
  pipe(
    custom<Uint8Array>((value) => value instanceof Uint8Array, messages.type),
    check((value) => value.length > 0, messages.nonEmpty),
    check(isImageBytes, messages.format),
  );
