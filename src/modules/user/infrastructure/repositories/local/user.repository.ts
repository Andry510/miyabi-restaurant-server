import type { PrismaClient } from '@generated/prisma/client';
import type { usersSelect, usersWhereInput } from '@generated/prisma/models';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { IUserRepository } from '../../../domain/interfaces/repositories';
import type { TUsersQuerySchema } from '../../../domain/schemas';
import type { TUserOutput, TUsersOutput } from '../../../domain/types/entities';
import type {
  TCreateUserInput,
  TUpdateUserInput,
  TUserConflicts,
} from '../../../domain/types/repositories';

//Infrastructure
import { PRISMA_ERROR_CODE } from '@infrastructure/constants';
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager, PrismaError } from '@infrastructure/database';
import { UserMapper } from '../../mappers';

const USER_SELECT = {
  id: true,
  status: true,
  created_at: true,
  updated_at: true,
  profile: { select: { first_name: true, last_name: true } },
  authentication: {
    select: { email: true, phone_number: true, password_need_reset: true },
  },
  assignments: {
    where: { status: true, deleted_at: null },
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
} satisfies usersSelect;

const ACTIVE_USER: usersWhereInput = {
  deleted_at: null,
  profile: { isNot: null },
  authentication: { isNot: null },
};

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findMany = (
    input: TUsersQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TUsersOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      UserRepository.name,
      async () => {
        const where: usersWhereInput = { ...ACTIVE_USER };

        if (input.first_name || input.last_name) {
          where.profile = {
            is: {
              first_name: input.first_name
                ? { contains: input.first_name, mode: 'insensitive' }
                : undefined,
              last_name: input.last_name
                ? { contains: input.last_name, mode: 'insensitive' }
                : undefined,
            },
          };
        }

        if (input.email || input.phone_number) {
          where.authentication = {
            is: {
              email: input.email
                ? { contains: input.email, mode: 'insensitive' }
                : undefined,
              phone_number: input.phone_number
                ? { contains: input.phone_number }
                : undefined,
            },
          };
        }

        const [count, response] = await Promise.all([
          this.primaryDatabase.users.count({ where }),
          this.primaryDatabase.users.findMany({
            where,
            select: USER_SELECT,
            orderBy: [{ profile: { first_name: 'asc' } }, { id: 'asc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return {
          count,
          data: response.map((user) => UserMapper.toUsersOutput(user)),
        };
      },
    );

  findById = (id: string): Promise<ResultPattern<TUserOutput | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      UserRepository.name,
      async () => {
        const response = await this.primaryDatabase.users.findFirst({
          where: { id, ...ACTIVE_USER },
          select: USER_SELECT,
        });

        return response ? UserMapper.toOutput(response) : null;
      },
    );

  doesExistById = (id: string): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      UserRepository.name,
      async () => {
        const count = await this.primaryDatabase.users.count({
          where: { id, ...ACTIVE_USER },
        });

        return count > 0;
      },
    );

  findConflicts = (
    email: string | null,
    phoneNumber: string | null,
    exceptUserId: string | null,
  ): Promise<ResultPattern<TUserConflicts>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      UserRepository.name,
      async () => {
        const conditions = [
          ...(email ? [{ email }] : []),
          ...(phoneNumber ? [{ phone_number: phoneNumber }] : []),
        ];

        if (conditions.length === 0) {
          return { email: false, phone_number: false };
        }

        const response = await this.primaryDatabase.authentications.findMany({
          where: {
            OR: conditions,
            ...(exceptUserId ? { user_id: { not: exceptUserId } } : {}),
          },
          select: { email: true, phone_number: true },
        });

        return {
          email: response.some((row) => email && row.email === email),
          phone_number: response.some(
            (row) => phoneNumber && row.phone_number === phoneNumber,
          ),
        };
      },
    );

  findAreaJobPositionId = (
    workAreaId: string,
    jobPositionId: string,
  ): Promise<ResultPattern<string | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      UserRepository.name,
      async () => {
        const response =
          await this.primaryDatabase.area_job_positions.findFirst({
            where: {
              work_area_id: workAreaId,
              job_position_id: jobPositionId,
              deleted_at: null,
              work_area: { status: true, deleted_at: null },
              job_position: { status: true, deleted_at: null },
            },
            select: { id: true },
          });

        return response?.id ?? null;
      },
    );

  create = (input: TCreateUserInput): Promise<ResultPattern<TUserOutput>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      UserRepository.name,
      async () => {
        const response = await this.primaryDatabase.users.create({
          data: {
            profile: {
              create: {
                first_name: input.first_name,
                last_name: input.last_name,
              },
            },
            authentication: {
              create: {
                email: input.email,
                password: input.password_hash,
                phone_number: input.phone_number ?? null,
                password_need_reset: true,
              },
            },
            assignments: input.area_job_position_id
              ? {
                  create: {
                    area_job_position_id: input.area_job_position_id,
                  },
                }
              : undefined,
          },
          select: USER_SELECT,
        });

        return UserMapper.toOutput(response);
      },
    );

  update = (
    input: TUpdateUserInput,
  ): Promise<ResultPattern<TUserOutput | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      UserRepository.name,
      async () => {
        const hasProfile =
          input.first_name !== undefined || input.last_name !== undefined;
        const hasAuthentication =
          input.email !== undefined ||
          input.phone_number !== undefined ||
          input.reset_password === true;

        try {
          const response = await this.primaryDatabase.users.update({
            where: { id: input.id, deleted_at: null },
            data: {
              status: input.status,
              profile: hasProfile
                ? {
                    update: {
                      first_name: input.first_name,
                      last_name: input.last_name,
                    },
                  }
                : undefined,
              authentication: hasAuthentication
                ? {
                    update: {
                      email: input.email,
                      phone_number: input.phone_number,
                      password_need_reset: input.reset_password || undefined,
                    },
                  }
                : undefined,
              assignments: input.area_job_position_id
                ? {
                    upsert: {
                      where: { user_id: input.id },
                      create: {
                        area_job_position_id: input.area_job_position_id,
                      },
                      update: {
                        area_job_position_id: input.area_job_position_id,
                        status: true,
                        deleted_at: null,
                      },
                    },
                  }
                : undefined,
              sessions: input.revoke_sessions_by
                ? {
                    updateMany: {
                      where: { status: 'active' },
                      data: {
                        status: 'revoked',
                        revoked_by: input.revoke_sessions_by,
                        revoked_at: new Date(),
                      },
                    },
                  }
                : undefined,
            },
            select: USER_SELECT,
          });

          return UserMapper.toOutput(response);
        } catch (error) {
          if (PrismaError.is(error, PRISMA_ERROR_CODE.NOT_FOUND)) {
            return null;
          }

          throw error;
        }
      },
    );

  softDelete = (
    id: string,
    revokedBy: string,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync('Infrastructure', UserRepository.name, () =>
      this.primaryDatabase.$transaction(async (transaction) => {
        const now = new Date();

        const { count } = await transaction.users.updateMany({
          where: { id, deleted_at: null },
          data: { deleted_at: now },
        });

        if (count === 0) {
          return false;
        }

        await transaction.sessions.updateMany({
          where: { user_id: id, status: 'active' },
          data: { status: 'revoked', revoked_by: revokedBy, revoked_at: now },
        });

        await transaction.user_assignments.updateMany({
          where: { user_id: id, deleted_at: null },
          data: { status: false, deleted_at: now },
        });

        await transaction.employee_shifts.updateMany({
          where: {
            user_assignment: { user_id: id },
            status: 'scheduled',
            scheduled_start: { gt: now },
            attendance_record: { is: null },
          },
          data: { status: 'cancelled' },
        });

        return true;
      }),
    );
}
