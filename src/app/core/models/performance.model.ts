export type GoalPriority = 'High' | 'Medium' | 'Low';
export type GoalStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';

export interface Goal {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  category: 'Strategic' | 'Operational' | 'Learning' | 'Leadership';
  priority: GoalPriority;
  status: GoalStatus;
  progressPercent: number;
  dueDate: string;
  assignedBy: string;
}

export interface AppraisalReview {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  reviewCycle: string;
  reviewerName: string;
  technicalScore: number; // 1-5
  communicationScore: number; // 1-5
  leadershipScore: number; // 1-5
  overallRating: number; // 1-5
  feedback: string;
  status: 'Draft' | 'Submitted' | 'Acknowledged';
}
