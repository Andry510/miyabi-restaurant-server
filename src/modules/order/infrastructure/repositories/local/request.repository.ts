import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { IRequestRepository } from '../../../domain/interfaces/repositories';
import type { TUpdateRequestSchema } from '../../../domain/schemas';
import type { TMyRequestOutput } from '../../../domain/types/entities';
import type {
  TRequestChangeResult,
  TSaveRequestInput,
} from '../../../domain/types/repositories';

//Infrastructure
import { PRISMA_ERROR_CODE } from '@infrastructure/constants';
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager, PrismaError } from '@infrastructure/database';
import { ORDER_PRODUCT_SELECT, OrderMapper } from '../../mappers';

const MY_REQUEST_SELECT = {
  id: true,
  requested_qty: true,
  note: true,
  product: { select: ORDER_PRODUCT_SELECT },
  transfer_draft: { select: { id: true, business_date: true, status: true } },
} as const;

@Injectable()
export class RequestRepository implements IRequestRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  isProductInArea = (
    productId: string,
    workAreaId: string,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      RequestRepository.name,
      async () =>
        (await this.primaryDatabase.area_products.count({
          where: {
            work_area_id: workAreaId,
            product_id: productId,
            deleted_at: null,
            product: { status: true, deleted_at: null },
          },
        })) > 0,
    );

  save = (
    input: TSaveRequestInput,
  ): Promise<ResultPattern<TMyRequestOutput | null>> =>
    ResultPattern.tryCatchAsync('Infrastructure', RequestRepository.name, () =>
      this.primaryDatabase.$transaction(async (transaction) => {
        const open = await transaction.transfer_drafts.count({
          where: { id: input.order_id, status: 'open' },
        });

        if (open === 0) {
          return null;
        }

        const response = await transaction.transfer_draft_requests.upsert({
          where: {
            transfer_draft_id_created_by_id_product_id: {
              transfer_draft_id: input.order_id,
              created_by_id: input.assignment_id,
              product_id: input.product_id,
            },
          },
          create: {
            transfer_draft_id: input.order_id,
            created_by_id: input.assignment_id,
            product_id: input.product_id,
            requested_qty: input.quantity,
            note: input.note,
          },
          update: { requested_qty: input.quantity, note: input.note },
          select: MY_REQUEST_SELECT,
        });

        return OrderMapper.toMyRequest(response, null);
      }),
    );

  update = (
    id: string,
    assignmentId: string,
    input: TUpdateRequestSchema,
  ): Promise<ResultPattern<TRequestChangeResult<TMyRequestOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      RequestRepository.name,
      async (): Promise<TRequestChangeResult<TMyRequestOutput>> => {
        try {
          const response =
            await this.primaryDatabase.transfer_draft_requests.update({
              where: {
                id,
                created_by_id: assignmentId,
                transfer_draft: { status: 'open' },
              },
              data: { requested_qty: input.quantity, note: input.note },
              select: MY_REQUEST_SELECT,
            });

          return { kind: 'ok', value: OrderMapper.toMyRequest(response, null) };
        } catch (error) {
          if (PrismaError.is(error, PRISMA_ERROR_CODE.NOT_FOUND)) {
            return this.missing(id, assignmentId);
          }

          throw error;
        }
      },
    );

  remove = (
    id: string,
    assignmentId: string,
  ): Promise<ResultPattern<TRequestChangeResult<null>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      RequestRepository.name,
      async (): Promise<TRequestChangeResult<null>> => {
        const { count } =
          await this.primaryDatabase.transfer_draft_requests.deleteMany({
            where: {
              id,
              created_by_id: assignmentId,
              transfer_draft: { status: 'open' },
            },
          });

        return count > 0
          ? { kind: 'ok', value: null }
          : this.missing(id, assignmentId);
      },
    );

  findMine = (
    assignmentId: string,
    from: string,
    to: string,
  ): Promise<ResultPattern<TMyRequestOutput[]>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      RequestRepository.name,
      async () => {
        const response =
          await this.primaryDatabase.transfer_draft_requests.findMany({
            where: {
              created_by_id: assignmentId,
              transfer_draft: {
                business_date: {
                  gte: OrderMapper.toDay(from),
                  lte: OrderMapper.toDay(to),
                },
              },
            },
            select: MY_REQUEST_SELECT,
            orderBy: [
              { transfer_draft: { business_date: 'desc' } },
              { created_at: 'asc' },
            ],
          });

        const sentItems =
          response.length === 0
            ? []
            : await this.primaryDatabase.transfer_draft_items.findMany({
                where: {
                  transfer_draft: { status: { not: 'open' } },
                  OR: response.map((row) => ({
                    transfer_draft_id: row.transfer_draft.id,
                    product_id: row.product.id,
                  })),
                },
                select: {
                  transfer_draft_id: true,
                  product_id: true,
                  quantity: true,
                },
              });

        const finalQuantity = new Map(
          sentItems.map((item) => [
            item.transfer_draft_id + ':' + item.product_id,
            item.quantity,
          ]),
        );

        return response.map((row) =>
          OrderMapper.toMyRequest(
            row,
            finalQuantity.get(row.transfer_draft.id + ':' + row.product.id) ??
              null,
          ),
        );
      },
    );

  //Functions
  private async missing(
    id: string,
    assignmentId: string,
  ): Promise<TRequestChangeResult<never>> {
    const exists = await this.primaryDatabase.transfer_draft_requests.count({
      where: { id, created_by_id: assignmentId },
    });

    return exists > 0 ? { kind: 'not_open' } : { kind: 'not_found' };
  }
}
