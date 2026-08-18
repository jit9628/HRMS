export type AttendanceStatus = 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave' | 'Holiday';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:mm:ss
  clockOut?: string; // HH:mm:ss
  workHours: number;
  status: AttendanceStatus;
  notes?: string;
  isOvertime?: boolean;
}

export interface DailyPunchState {
  isClockedIn: boolean;
  clockInTime: string | null;
  elapsedSeconds: number;
}
