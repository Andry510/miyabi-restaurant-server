export type TLinkPair = {
  work_area_id: string;
  job_position_id: string;
};

export type TLinkSide = { work_area_id: string } | { job_position_id: string };

export type TUnlinkResult = 'unlinked' | 'not_linked' | 'has_employees';
