//Domain
import type {
  TDispatchPlan,
  TOrderDraft,
  TOrderLine,
} from '../../types/repositories';

export class OrderAggregate {
  private readonly draft: TOrderDraft;
  private readonly suggestions: Map<string, string>;

  private constructor(draft: TOrderDraft, suggestions: Map<string, string>) {
    this.draft = draft;
    this.suggestions = suggestions;
  }

  //Create
  static register = (
    draft: TOrderDraft,
    suggestions: Map<string, string>,
  ): OrderAggregate => new OrderAggregate(draft, suggestions);

  //Get
  get Lines(): TOrderLine[] {
    const items = new Map(
      this.draft.items.map((item) => [item.product.id, item]),
    );
    const lines = new Map<string, TOrderLine>();

    for (const { product, ...request } of this.draft.requests) {
      const line = lines.get(product.id) ?? this.emptyLine(product);
      line.requested_quantity += request.quantity;
      line.requests.push(request);
      lines.set(product.id, line);
    }

    for (const item of this.draft.items) {
      if (!lines.has(item.product.id)) {
        lines.set(item.product.id, this.emptyLine(item.product));
      }
    }

    return [...lines.values()]
      .map((line) => {
        const item = items.get(line.product.id);

        return {
          ...line,
          quantity: item ? item.quantity : line.requested_quantity,
          to_location_id: item?.to_location_id ?? line.suggested_location_id,
          overridden: Boolean(item),
        };
      })
      .sort((a, b) => a.product.name.localeCompare(b.product.name));
  }

  static plan = (
    lines: TOrderLine[],
    idempotencyKey: () => string,
  ): TDispatchPlan[] => {
    const byLocation = new Map<string, string[]>();

    for (const line of lines) {
      if (line.quantity > 0 && line.to_location_id) {
        byLocation.set(line.to_location_id, [
          ...(byLocation.get(line.to_location_id) ?? []),
          line.product.id,
        ]);
      }
    }

    return [...byLocation].map(([toLocationId, productIds]) => ({
      idempotency_key: idempotencyKey(),
      to_location_id: toLocationId,
      product_ids: productIds,
    }));
  };

  //Functions
  private emptyLine(product: TOrderLine['product']): TOrderLine {
    return {
      product,
      requested_quantity: 0,
      quantity: 0,
      to_location_id: null,
      suggested_location_id: this.suggestions.get(product.id) ?? null,
      overridden: false,
      requests: [],
    };
  }
}
