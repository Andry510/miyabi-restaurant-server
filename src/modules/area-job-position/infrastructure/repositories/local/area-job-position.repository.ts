import type { PrismaClient } from '@generated/prisma/client';
import type {
  area_job_positionsWhereInput,
  user_assignmentsWhereInput,
} from '@generated/prisma/models';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { IAreaJobPositionRepository } from '../../../domain/interfaces/repositories';
import type { TLinksQuerySchema } from '../../../domain/schemas';
import type {
  TLinkedOutput,
  TLinkedUserOutput,
} from '../../../domain/types/entities';
import type {
  TLinkPair,
  TLinkSide,
  TUnlinkResult,
} from '../../../domain/types/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { AreaJobPositionMapper } from '../../mappers';

const LINKED_SELECT = {
  id: true,
  name: true,
  description: true,
  status: true,
};

const ACTIVE_ASSIGNMENT: user_assignmentsWhereInput = {
  status: true,
  deleted_at: null,
  user: { deleted_at: null },
};

const activeLinks = (pairs: TLinkPair[]): area_job_positionsWhereInput => ({
  OR: pairs,
  deleted_at: null,
});

@Injectable()
export class AreaJobPositionRepository implements IAreaJobPositionRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findJobPositionsByWorkArea = (
    workAreaId: string,
    input: TLinksQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TLinkedOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AreaJobPositionRepository.name,
      async () => {
        const where = {
          deleted_at: null,
          area_job_positions: {
            some: { work_area_id: workAreaId, deleted_at: null },
          },
        };

        const [count, response] = await Promise.all([
          this.primaryDatabase.job_positions.count({ where }),
          this.primaryDatabase.job_positions.findMany({
            where,
            select: LINKED_SELECT,
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return {
          count,
          data: response.map((row) =>
            AreaJobPositionMapper.toLinkedOutput(row),
          ),
        };
      },
    );

  findWorkAreasByJobPosition = (
    jobPositionId: string,
    input: TLinksQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TLinkedOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AreaJobPositionRepository.name,
      async () => {
        const where = {
          deleted_at: null,
          area_job_positions: {
            some: { job_position_id: jobPositionId, deleted_at: null },
          },
        };

        const [count, response] = await Promise.all([
          this.primaryDatabase.work_areas.count({ where }),
          this.primaryDatabase.work_areas.findMany({
            where,
            select: LINKED_SELECT,
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return {
          count,
          data: response.map((row) =>
            AreaJobPositionMapper.toLinkedOutput(row),
          ),
        };
      },
    );

  findUsers = (
    side: TLinkSide,
    input: TLinksQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TLinkedUserOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AreaJobPositionRepository.name,
      async () => {
        const assignment: user_assignmentsWhereInput = {
          ...ACTIVE_ASSIGNMENT,
          area_job_position: { ...side, deleted_at: null },
        };
        const where = { deleted_at: null, assignments: { some: assignment } };

        const [count, response] = await Promise.all([
          this.primaryDatabase.users.count({ where }),
          this.primaryDatabase.users.findMany({
            where,
            select: {
              id: true,
              status: true,
              profile: { select: { first_name: true, last_name: true } },
              authentication: { select: { email: true } },
              assignments: {
                where: assignment,
                select: {
                  area_job_position: {
                    select: {
                      work_area: { select: { id: true, name: true } },
                      job_position: { select: { id: true, name: true } },
                    },
                  },
                },
                take: 1,
              },
            },
            orderBy: [{ profile: { first_name: 'asc' } }, { id: 'asc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return {
          count,
          data: response.flatMap((row) => {
            const user = AreaJobPositionMapper.toUserOutput(row);
            return user ? [user] : [];
          }),
        };
      },
    );

  link = (pairs: TLinkPair[]): Promise<ResultPattern<void>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AreaJobPositionRepository.name,
      async () => {
        await this.primaryDatabase.$transaction([
          this.primaryDatabase.area_job_positions.createMany({
            data: pairs,
            skipDuplicates: true,
          }),
          this.primaryDatabase.area_job_positions.updateMany({
            where: { OR: pairs, deleted_at: { not: null } },
            data: { deleted_at: null },
          }),
        ]);
      },
    );

  unlink = (pairs: TLinkPair[]): Promise<ResultPattern<TUnlinkResult>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AreaJobPositionRepository.name,
      () =>
        this.primaryDatabase.$transaction(
          async (transaction): Promise<TUnlinkResult> => {
            const linked = await transaction.area_job_positions.count({
              where: activeLinks(pairs),
            });

            if (linked !== pairs.length) {
              return 'not_linked';
            }

            const employees = await transaction.user_assignments.count({
              where: {
                ...ACTIVE_ASSIGNMENT,
                area_job_position: activeLinks(pairs),
              },
            });

            if (employees > 0) {
              return 'has_employees';
            }

            await transaction.area_job_positions.updateMany({
              where: activeLinks(pairs),
              data: { deleted_at: new Date() },
            });

            return 'unlinked';
          },
        ),
    );
}
