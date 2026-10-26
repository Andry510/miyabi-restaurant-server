import {
  array,
  type InferOutput,
  minLength,
  pipe,
  strictObject,
  string,
  transform,
  uuid,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../api/messages';

//Domain
import { PaginationQuerySchema } from '@domain/schemas/shared';

const idList = (messages: {
  type: string;
  minLength: string;
  itemType: string;
  itemUuid: string;
}) =>
  pipe(
    array(
      pipe(string(messages.itemType), uuid(messages.itemUuid)),
      messages.type,
    ),
    minLength(1, messages.minLength),
    transform((ids) => [...new Set(ids)]),
  );

export const JobPositionsIdsBodySchema = strictObject({
  job_positions_ids: idList(ERROR_MESSAGE_SCHEMA.job_positions_ids),
});

export type TJobPositionsIdsBodySchema = InferOutput<
  typeof JobPositionsIdsBodySchema
>;

export const WorkAreasIdsBodySchema = strictObject({
  work_areas_ids: idList(ERROR_MESSAGE_SCHEMA.work_areas_ids),
});

export type TWorkAreasIdsBodySchema = InferOutput<
  typeof WorkAreasIdsBodySchema
>;

export const LinksQuerySchema = pipe(
  strictObject({ ...PaginationQuerySchema }),
  transform(({ limit, page }) => ({
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  })),
);

export type TLinksQuerySchema = InferOutput<typeof LinksQuerySchema>;
