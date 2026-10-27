import type { PrismaClient } from '@generated/prisma/client';
import type { transfer_draftsWhereInput } from '@generated/prisma/models';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { IOrderRepository } from '../../../domain/interfaces/repositories';
import type { TOrdersQuerySchema } from '../../../domain/schemas';
import type { TOrderOutput } from '../../../domain/types/entities';
import type {
  TDispatchPlan,
  TDispatchResult,
  TDispatchToSend,
  TOrderDraft,
  TOrderLine,
} from '../../../domain/types/repositories';

//Infrastructure
import { PRISMA_ERROR_CODE } from '@infrastructure/constants';
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager, PrismaError } from '@infrastructure/database';
import {
  DISPATCH_SELECT,
  ORDER_PRODUCT_SELECT,
  OrderMapper,
} from '../../mappers';

const ORDER_SELECT = {
  id: true,
  business_date: true,
  status: true,
  sent_by: true,
  sent_at: true,
  created_at: true,
  updated_at: true,
} as const;

@Injectable()
export class OrderRepository implements IOrderRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  openOrderId = (businessDate: string): Promise<ResultPattern<string>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      OrderRepository.name,
      async () => {
        const open = await this.findOpen();

        if (open) {
          return open;
        }

        try {
          const response = await this.primaryDatabase.transfer_drafts.create({
            data: { business_date: OrderMapper.toDay(businessDate) },
            select: { id: true },
          });

          return response.id;
        } catch (error) {
          if (PrismaError.is(error, PRISMA_ERROR_CODE.UNIQUE)) {
            const raced = await this.findOpen();

            if (raced) {
              return raced;
            }
          }

          throw error;
        }
      },
    );

  findOpenOrderId = (): Promise<ResultPattern<string | null>> =>
    ResultPattern.tryCatchAsync('Infrastructure', OrderRepository.name, () =>
      this.findOpen(),
    );

  findDraft = (id: string): Promise<ResultPattern<TOrderDraft | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      OrderRepository.name,
      async () => {
        const response = await this.primaryDatabase.transfer_drafts.findUnique({
          where: { id },
          select: {
            ...ORDER_SELECT,
            requests: {
              select: {
                id: true,
                requested_qty: true,
                note: true,
                product: { select: ORDER_PRODUCT_SELECT },
                created_by: {
                  select: {
                    user: {
                      select: {
                        id: true,
                        profile: {
                          select: { first_name: true, last_name: true },
                        },
                      },
                    },
                    area_job_position: {
                      select: {
                        work_area: { select: { id: true, name: true } },
                      },
                    },
                  },
                },
              },
              orderBy: { created_at: 'asc' },
            },
            items: {
              select: {
                quantity: true,
                to_location_id: true,
                product: { select: ORDER_PRODUCT_SELECT },
              },
            },
            dispatches: {
              select: {
                id: true,
                to_location_id: true,
                status: true,
                transfer_id: true,
                last_error: true,
                sent_at: true,
              },
              orderBy: { created_at: 'asc' },
            },
          },
        });

        if (!response) {
          return null;
        }

        const { requests, items, dispatches, ...header } = response;

        return {
          header: OrderMapper.toOrder(header),
          requests: requests.map((request) => ({
            id: request.id,
            user: OrderMapper.toUser(request.created_by.user),
            work_area: request.created_by.area_job_position.work_area,
            quantity: request.requested_qty,
            note: request.note,
            product: request.product,
          })),
          items: items.map((item) => ({
            product: item.product,
            quantity: item.quantity,
            to_location_id: item.to_location_id,
          })),
          dispatches: dispatches.map((dispatch) =>
            OrderMapper.toDispatch(dispatch),
          ),
        };
      },
    );

  findSuggestions = (
    productIds: string[],
  ): Promise<ResultPattern<Map<string, string>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      OrderRepository.name,
      async () => {
        if (productIds.length === 0) {
          return new Map<string, string>();
        }

        const response =
          await this.primaryDatabase.transfer_draft_items.findMany({
            where: {
              product_id: { in: productIds },
              transfer_draft_dispatch: { status: 'sent' },
            },
            select: { product_id: true, to_location_id: true },
            orderBy: { updated_at: 'desc' },
            distinct: ['product_id'],
          });

        return new Map(
          response.flatMap((row) =>
            row.to_location_id ? [[row.product_id, row.to_location_id]] : [],
          ),
        );
      },
    );

  saveItem = (
    orderId: string,
    productId: string,
    quantity: number,
    toLocationId: string | null,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync('Infrastructure', OrderRepository.name, () =>
      this.primaryDatabase.$transaction(async (transaction) => {
        const open = await transaction.transfer_drafts.count({
          where: { id: orderId, status: 'open' },
        });

        if (open === 0) {
          return false;
        }

        await transaction.transfer_draft_items.upsert({
          where: {
            transfer_draft_id_product_id: {
              transfer_draft_id: orderId,
              product_id: productId,
            },
          },
          create: {
            transfer_draft_id: orderId,
            product_id: productId,
            quantity,
            to_location_id: toLocationId,
          },
          update: { quantity, to_location_id: toLocationId },
        });

        return true;
      }),
    );

  resetItem = (
    orderId: string,
    productId: string,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      OrderRepository.name,
      async () => {
        const { count } =
          await this.primaryDatabase.transfer_draft_items.deleteMany({
            where: {
              transfer_draft_id: orderId,
              product_id: productId,
              transfer_draft: { status: 'open' },
            },
          });

        return count > 0;
      },
    );

  startSend = (
    orderId: string,
    lines: TOrderLine[],
    plans: TDispatchPlan[],
    sentBy: string | null,
  ): Promise<ResultPattern<TDispatchToSend[] | null>> =>
    ResultPattern.tryCatchAsync('Infrastructure', OrderRepository.name, () =>
      this.primaryDatabase.$transaction(async (transaction) => {
        const { count } = await transaction.transfer_drafts.updateMany({
          where: { id: orderId, status: 'open' },
          data: {
            status: 'sending',
            open_lock: null,
            sent_by: sentBy,
            sent_at: new Date(),
          },
        });

        if (count === 0) {
          return null;
        }

        await transaction.transfer_draft_items.deleteMany({
          where: { transfer_draft_id: orderId },
        });

        await transaction.transfer_draft_items.createMany({
          data: lines.map((line) => ({
            transfer_draft_id: orderId,
            product_id: line.product.id,
            quantity: line.quantity,
            to_location_id: line.to_location_id,
          })),
        });

        const dispatches: TDispatchToSend[] = [];

        for (const plan of plans) {
          const dispatch = await transaction.transfer_draft_dispatches.create({
            data: {
              transfer_draft_id: orderId,
              to_location_id: plan.to_location_id,
              idempotency_key: plan.idempotency_key,
            },
            select: { id: true },
          });

          await transaction.transfer_draft_items.updateMany({
            where: {
              transfer_draft_id: orderId,
              product_id: { in: plan.product_ids },
            },
            data: { transfer_draft_dispatch_id: dispatch.id },
          });

          dispatches.push(
            OrderMapper.toDispatchToSend(
              await transaction.transfer_draft_dispatches.findUniqueOrThrow({
                where: { id: dispatch.id },
                select: DISPATCH_SELECT,
              }),
            ),
          );
        }

        return dispatches;
      }),
    );

  findPendingDispatches = (
    orderId: string,
  ): Promise<ResultPattern<TDispatchToSend[] | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      OrderRepository.name,
      async () => {
        const response = await this.primaryDatabase.transfer_drafts.findUnique({
          where: { id: orderId },
          select: {
            status: true,
            dispatches: {
              where: { status: { in: ['pending', 'failed'] } },
              select: DISPATCH_SELECT,
            },
          },
        });

        if (!response || response.status === 'open') {
          return null;
        }

        return response.dispatches.map((dispatch) =>
          OrderMapper.toDispatchToSend(dispatch),
        );
      },
    );

  finishSend = (
    orderId: string,
    results: TDispatchResult[],
  ): Promise<ResultPattern<null>> =>
    ResultPattern.tryCatchAsync('Infrastructure', OrderRepository.name, () =>
      this.primaryDatabase.$transaction(async (transaction) => {
        for (const result of results) {
          await transaction.transfer_draft_dispatches.update({
            where: { id: result.id },
            data: result.sent
              ? {
                  status: 'sent',
                  transfer_id: result.transfer_id,
                  last_error: null,
                  sent_at: new Date(),
                }
              : { status: 'failed', last_error: result.error.slice(0, 255) },
          });
        }

        const pending = await transaction.transfer_draft_dispatches.count({
          where: { transfer_draft_id: orderId, status: { not: 'sent' } },
        });

        await transaction.transfer_drafts.update({
          where: { id: orderId },
          data: { status: pending === 0 ? 'sent' : 'partially_sent' },
        });

        return null;
      }),
    );

  findMany = (
    input: TOrdersQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TOrderOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      OrderRepository.name,
      async () => {
        const where: transfer_draftsWhereInput = {
          business_date: {
            gte: OrderMapper.toDay(input.from),
            lte: OrderMapper.toDay(input.to),
          },
          status: input.status,
        };

        const [count, response] = await Promise.all([
          this.primaryDatabase.transfer_drafts.count({ where }),
          this.primaryDatabase.transfer_drafts.findMany({
            where,
            select: ORDER_SELECT,
            orderBy: [{ business_date: 'desc' }, { created_at: 'desc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return { count, data: response.map((row) => OrderMapper.toOrder(row)) };
      },
    );

  //Functions
  private async findOpen(): Promise<string | null> {
    const response = await this.primaryDatabase.transfer_drafts.findUnique({
      where: { open_lock: true },
      select: { id: true },
    });

    return response?.id ?? null;
  }
}
