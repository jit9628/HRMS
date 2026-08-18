export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Paid Leave' | 'Maternity / Paternity' | 'Bereavement';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  approverComments?: string;
}

export interface LeaveBalance {
  casualLeave: { used: number; total: number };
  sickLeave: { used: number; total: number };
  paidLeave: { used: number; total: number };
  maternityLeave: { used: number; total: number };
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  day: string;
  type: 'Public' | 'Optional';
}
