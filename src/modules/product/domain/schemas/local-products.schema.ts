import { type InferOutput, pipe, transform } from 'valibot';

//Domain
import { ProductsQuerySchema } from './products.schema';

export const LocalProductsQuerySchema = pipe(
  ProductsQuerySchema,
  transform(({ limit, page, ...rest }) => ({
    ...rest,
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  })),
);

export type TLocalProductsQuerySchema = InferOutput<
  typeof LocalProductsQuerySchema
>;
