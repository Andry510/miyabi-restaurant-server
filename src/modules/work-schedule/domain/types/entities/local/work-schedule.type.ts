export type TWorkScheduleOutput = {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  late_tolerance_minutes: number;
  early_leave_tolerance_minutes: number;
  status: boolean;
  created_at: Date;
  updated_at: Date;
};
