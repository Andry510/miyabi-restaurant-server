import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import type { TIP_SPLIT_METHOD } from '@domain/enums/shared';
import { ResultPattern } from '@domain/patterns/results';
import type { IRuleRepository } from '../../../domain/interfaces/repositories';
import type { TRulesBodySchema } from '../../../domain/schemas';
import type { TTipRuleConfig } from '../../../domain/types/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { Money } from '@infrastructure/utils';

@Injectable()
export class RuleRepository implements IRuleRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findRules = (): Promise<ResultPattern<TTipRuleConfig[]>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      RuleRepository.name,
      async () => {
        const response = await this.primaryDatabase.work_areas.findMany({
          where: { deleted_at: null },
          select: {
            id: true,
            name: true,
            tip_rule: { select: { percentage: true, method: true } },
            area_job_positions: {
              where: { deleted_at: null, job_position: { deleted_at: null } },
              select: {
                tip_weight: true,
                job_position: { select: { id: true, name: true } },
              },
              orderBy: { job_position: { name: 'asc' } },
            },
          },
          orderBy: { name: 'asc' },
        });

        return response.map((area) => ({
          work_area: { id: area.id, name: area.name },
          percentage_bp: area.tip_rule
            ? Money.toCents(area.tip_rule.percentage)
            : null,
          method: (area.tip_rule?.method ?? null) as TIP_SPLIT_METHOD | null,
          positions: area.area_job_positions.map((link) => ({
            job_position: link.job_position,
            weight_bp: Money.toCents(link.tip_weight),
          })),
        }));
      },
    );

  replaceRules = (
    rules: TRulesBodySchema['rules'],
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync('Infrastructure', RuleRepository.name, () =>
      this.primaryDatabase.$transaction(async (transaction) => {
        const pairs = rules.flatMap((rule) =>
          rule.weights.map((item) => ({
            work_area_id: rule.work_area_id,
            job_position_id: item.job_position_id,
            weight: item.weight,
          })),
        );

        if (pairs.length > 0) {
          const linked = await transaction.area_job_positions.count({
            where: {
              deleted_at: null,
              OR: pairs.map(({ work_area_id, job_position_id }) => ({
                work_area_id,
                job_position_id,
              })),
            },
          });

          if (linked !== pairs.length) {
            return false;
          }
        }

        await transaction.tip_area_rules.deleteMany({
          where: {
            work_area_id: { notIn: rules.map((rule) => rule.work_area_id) },
          },
        });

        for (const rule of rules) {
          const data = {
            percentage: rule.percentage.toFixed(2),
            method: rule.method,
          };

          await transaction.tip_area_rules.upsert({
            where: { work_area_id: rule.work_area_id },
            create: { work_area_id: rule.work_area_id, ...data },
            update: data,
          });
        }

        for (const pair of pairs) {
          await transaction.area_job_positions.updateMany({
            where: {
              work_area_id: pair.work_area_id,
              job_position_id: pair.job_position_id,
              deleted_at: null,
            },
            data: { tip_weight: pair.weight.toFixed(2) },
          });
        }

        return true;
      }),
    );
}
