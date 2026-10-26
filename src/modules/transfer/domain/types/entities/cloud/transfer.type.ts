type TLocationMetadata = {
  id: string;
  name: string;
  picture: string;
};

type TUserMetadata = {
  id: string;
  full_name: string;
};

export type TTransferOutput = {
  id: string;
  from: TLocationMetadata;
  to: TLocationMetadata;
  status: string;
  note?: string;
  requested_by: TUserMetadata;
  accepted_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  shipped_at?: string;
  received_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  delivery?: TUserMetadata;
};

export type TTransfersOutput = {
  id: string;
  from: TLocationMetadata;
  to: TLocationMetadata;
  items_count: number;
  status: string;
  created_at: string;
};
