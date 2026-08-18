export interface SalaryComponent {
  name: string;
  amount: number;
}

export interface Payslip {
  id: string;
  payrollMonth: string; // "January 2026", "February 2026", etc.
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  bankAccount: string;
  pan: string;
  workingDays: number;
  paidDays: number;
  lossOfPayDays: number;
  
  // Earnings
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  performanceBonus: number;
  grossEarnings: number;

  // Deductions
  providentFund: number;
  professionalTax: number;
  taxDeductedAtSource: number;
  healthInsurance: number;
  totalDeductions: number;

  // Final
  netSalary: number;
  paymentStatus: 'Paid' | 'Processing' | 'Pending';
  paymentDate?: string;
}
