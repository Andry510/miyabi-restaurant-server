import {
  array,
  type ArrayIssue,
  type ArraySchema,
  type ErrorMessage,
  pipe,
  type SchemaWithPipe,
  string,
  type StringIssue,
  type StringSchema,
  transform,
  type TransformAction,
  uuid,
  type UuidAction,
  type UuidIssue,
} from 'valibot';

type TUuidListMessages = {
  type: string;
  itemType: string;
  itemUuid: string;
};

type TUuidListSchema = SchemaWithPipe<
  readonly [
    ArraySchema<
      SchemaWithPipe<
        readonly [
          StringSchema<ErrorMessage<StringIssue>>,
          UuidAction<string, ErrorMessage<UuidIssue<string>>>,
        ]
      >,
      ErrorMessage<ArrayIssue>
    >,
    TransformAction<string[], string[]>,
  ]
>;

export const uuidList = (messages: TUuidListMessages): TUuidListSchema =>
  pipe(
    array(
      pipe(string(messages.itemType), uuid(messages.itemUuid)),
      messages.type,
    ),
    transform((ids) => [...new Set(ids)]),
  );
