import {
  type InferOutput,
  minLength,
  pipe,
  strictObject,
  transform,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../../api/messages';

//Domain
import { PaginationQuerySchema, uuidList } from '@domain/schemas/shared';

export const JobPositionsIdsBodySchema = strictObject({
  job_positions_ids: pipe(
    uuidList(ERROR_MESSAGE_SCHEMA.job_positions_ids),
    minLength(1, ERROR_MESSAGE_SCHEMA.job_positions_ids.minLength),
  ),
});

export type TJobPositionsIdsBodySchema = InferOutput<
  typeof JobPositionsIdsBodySchema
>;

export const WorkAreasIdsBodySchema = strictObject({
  work_areas_ids: pipe(
    uuidList(ERROR_MESSAGE_SCHEMA.work_areas_ids),
    minLength(1, ERROR_MESSAGE_SCHEMA.work_areas_ids.minLength),
  ),
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
