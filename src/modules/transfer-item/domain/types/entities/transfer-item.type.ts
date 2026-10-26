export type TTransferItemsOutput = {
  id: string;
  product: { id: string; name: string; picture: string; unit: string };
  status: string;
  requested_qty: string;
  accepted_qty?: string;
  sent_qty?: string;
  received_qty?: string;
  issue_note?: string;
};
