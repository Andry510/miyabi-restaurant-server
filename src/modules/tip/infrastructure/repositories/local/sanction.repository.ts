import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { ISanctionRepository } from '../../../domain/interfaces/repositories';
import type {
  TSanctionTypeBodySchema,
  TUpdateSanctionTypeBodySchema,
} from '../../../domain/schemas';
import type { TTipSanctionTypeOutput } from '../../../domain/types/entities';
import type { TCreateTipSanctionInput } from '../../../domain/types/repositories';

//Infrastructure
import { PRISMA_ERROR_CODE } from '@infrastructure/constants';
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager, PrismaError } from '@infrastructure/database';
import { TipMapper } from '../../mappers';

export const SANCTION_SELECT = {
  id: true,
  user_assignment_id: true,
  shifts: true,
  removes_all: true,
  note: true,
  created_by: true,
  created_at: true,
  tip_sanction_type: { select: { id: true, name: true } },
  user_assignment: {
    select: {
      user: {
        select: {
          id: true,
          profile: { select: { first_name: true, last_name: true } },
        },
      },
    },
  },
} as const;

const TYPE_SELECT = {
  id: true,
  name: true,
  shifts: true,
  removes_all: true,
  created_at: true,
  updated_at: true,
} as const;

@Injectable()
export class SanctionRepository implements ISanctionRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findTypes = (): Promise<ResultPattern<TTipSanctionTypeOutput[]>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SanctionRepository.name,
      async () => {
        const response = await this.primaryDatabase.tip_sanction_types.findMany(
          {
            select: TYPE_SELECT,
            orderBy: { name: 'asc' },
          },
        );

        return response.map((row) => TipMapper.toSanctionTypeOutput(row));
      },
    );

  findType = (
    id: string,
  ): Promise<ResultPattern<TTipSanctionTypeOutput | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SanctionRepository.name,
      async () => {
        const response =
          await this.primaryDatabase.tip_sanction_types.findUnique({
            where: { id },
            select: TYPE_SELECT,
          });

        return response ? TipMapper.toSanctionTypeOutput(response) : null;
      },
    );

  createType = (
    input: TSanctionTypeBodySchema,
  ): Promise<ResultPattern<TTipSanctionTypeOutput | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SanctionRepository.name,
      async () => {
        try {
          const response = await this.primaryDatabase.tip_sanction_types.create(
            { data: input, select: TYPE_SELECT },
          );

          return TipMapper.toSanctionTypeOutput(response);
        } catch (error) {
          if (PrismaError.is(error, PRISMA_ERROR_CODE.UNIQUE)) {
            return null;
          }

          throw error;
        }
      },
    );

  updateType = (
    id: string,
    input: TUpdateSanctionTypeBodySchema,
  ): Promise<
    ResultPattern<TTipSanctionTypeOutput | 'not_found' | 'duplicated'>
  > =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SanctionRepository.name,
      async () => {
        try {
          const response = await this.primaryDatabase.tip_sanction_types.update(
            { where: { id }, data: input, select: TYPE_SELECT },
          );

          return TipMapper.toSanctionTypeOutput(response);
        } catch (error) {
          if (PrismaError.is(error, PRISMA_ERROR_CODE.NOT_FOUND)) {
            return 'not_found' as const;
          }

          if (PrismaError.is(error, PRISMA_ERROR_CODE.UNIQUE)) {
            return 'duplicated' as const;
          }

          throw error;
        }
      },
    );

  removeType = (
    id: string,
  ): Promise<ResultPattern<'ok' | 'not_found' | 'in_use'>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SanctionRepository.name,
      async () => {
        const used = await this.primaryDatabase.tip_sanctions.count({
          where: { tip_sanction_type_id: id },
        });

        if (used > 0) {
          return 'in_use' as const;
        }

        const { count } =
          await this.primaryDatabase.tip_sanction_types.deleteMany({
            where: { id },
          });

        return count > 0 ? ('ok' as const) : ('not_found' as const);
      },
    );

  create = (
    input: TCreateTipSanctionInput,
    type: TTipSanctionTypeOutput,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync('Infrastructure', SanctionRepository.name, () =>
      this.primaryDatabase.$transaction(async (transaction) => {
        const open = await transaction.tip_pools.count({
          where: { id: input.tip_pool_id, status: 'open' },
        });

        if (open === 0) {
          return false;
        }

        await transaction.tip_sanctions.create({
          data: {
            tip_pool_id: input.tip_pool_id,
            user_assignment_id: input.assignment_id,
            tip_sanction_type_id: input.sanction_type_id,
            shifts: type.shifts.toFixed(2),
            removes_all: type.removes_all,
            note: input.note,
            created_by: input.created_by,
          },
          select: { id: true },
        });

        return true;
      }),
    );

  remove = (
    poolId: string,
    sanctionId: string,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SanctionRepository.name,
      async () => {
        const { count } = await this.primaryDatabase.tip_sanctions.deleteMany({
          where: {
            id: sanctionId,
            tip_pool_id: poolId,
            tip_pool: { status: 'open' },
          },
        });

        return count > 0;
      },
    );
}
