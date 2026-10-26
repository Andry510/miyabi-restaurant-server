import { safeParse } from 'valibot';
import type { products, units } from '@generated/prisma/client';

//Domain
import { DomainErrorFactory } from '@domain/patterns/errors';
import { ResultPattern } from '@domain/patterns/results';
import { Product } from '../../domain/entities';
import {
  CloudProductRemovedSchema,
  CloudProductSchema,
} from '../../domain/schemas';

type TProductPersistence = Omit<products, 'id' | 'created_at' | 'updated_at'>;

export class ProductMapper {
  static fromCloud(payload: unknown): ResultPattern<Product> {
    const result = safeParse(CloudProductSchema, payload);

    if (result.issues) {
      return ResultPattern.Failure(
        DomainErrorFactory.Domain(
          result.issues.map((issue) => issue.message).join('; '),
          ProductMapper.name,
        ),
      );
    }

    const { id, description, picture, barcode, updated_at, ...props } =
      result.output;

    return ResultPattern.Success(
      Product.register({
        name: props.name,
        storage_code: props.storage_code,
        unit: props.unit,
        status: props.status,
        cloud_id: id,
        description: description ?? null,
        picture: picture ?? null,
        barcode: barcode ?? null,
        cloud_updated_at: updated_at,
      }),
    );
  }

  static removedIdFromCloud(payload: unknown): ResultPattern<string> {
    const result = safeParse(CloudProductRemovedSchema, payload);

    if (result.issues) {
      return ResultPattern.Failure(
        DomainErrorFactory.Domain(
          result.issues.map((issue) => issue.message).join('; '),
          ProductMapper.name,
        ),
      );
    }

    return ResultPattern.Success(result.output.id);
  }

  static toPersistence(product: Product): TProductPersistence {
    const { unit, ...props } = product.Output;

    return {
      ...props,
      unit: unit as units,
      deleted_at: null,
    };
  }
}
