export type TPairingStatus = 'unpaired' | 'paired' | 'unlinked';

export type TPairingState = {
  status: TPairingStatus;
  location_id: string | null;
  unlinked_reason: string | null;
  paired_at: Date | null;
  unlinked_at: Date | null;
};

export type TPairingRow = TPairingState & {
  server_token_enc: string | null;
};

export type TPairInput = {
  server_token_enc: string;
  location_id: string;
  wipe: boolean;
};

export type TUnlinkedHandler = (state: TPairingState) => Promise<void> | void;
