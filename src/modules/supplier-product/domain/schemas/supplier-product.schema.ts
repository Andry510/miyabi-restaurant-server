import {
  type InferOutput,
  nonEmpty,
  pipe,
  strictObject,
  string,
  uuid,
} from 'valibot';

//Api
import { ERROR_MESSAGE_SCHEMA } from '../../api/messages';

export const SupplierProductParamSchema = strictObject({
  supplier_id: pipe(
    string(ERROR_MESSAGE_SCHEMA.supplier_id.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.supplier_id.nonEmpty),
    uuid(ERROR_MESSAGE_SCHEMA.supplier_id.uuid),
  ),
  product_id: pipe(
    string(ERROR_MESSAGE_SCHEMA.product_id.type),
    nonEmpty(ERROR_MESSAGE_SCHEMA.product_id.nonEmpty),
    uuid(ERROR_MESSAGE_SCHEMA.product_id.uuid),
  ),
});

export type TSupplierProductParamSchema = InferOutput<
  typeof SupplierProductParamSchema
>;
