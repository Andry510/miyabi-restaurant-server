export type TRegisterOutput = {
  name: string;
  location_id: string;
};

export type TPairingStatusOutput = {
  status: string;
  location_id: string | null;
  unlinked_reason: string | null;
  paired_at: Date | null;
  unlinked_at: Date | null;
};
