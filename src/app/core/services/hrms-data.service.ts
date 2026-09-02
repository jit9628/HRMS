import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee, Department, Designation } from '../models/employee.model';
import { AttendanceRecord, DailyPunchState } from '../models/attendance.model';
import { LeaveRequest, LeaveBalance, Holiday } from '../models/leave.model';
import { Payslip } from '../models/payroll.model';
import { JobPosting, Candidate } from '../models/recruitment.model';
import { Goal, AppraisalReview } from '../models/performance.model';
import { CompanyProfile, Announcement } from '../models/company.model';
import { ApiResponse } from '../models/auth.model';
import { EmployeeApiService } from './employee-api.service';

@Injectable({
  providedIn: 'root'
})
export class HrmsDataService {
  private readonly http = inject(HttpClient);
  private readonly employeeApi = inject(EmployeeApiService);
  private readonly COMPANIES_API_URL = 'http://localhost:8080/api/v1/companies';

  // Local storage keys
  private readonly ATTENDANCE_KEY = 'pulse_hrms_attendance';
  private readonly LEAVES_KEY = 'pulse_hrms_leaves';
  private readonly PAYROLL_KEY = 'pulse_hrms_payroll';
  private readonly JOBS_KEY = 'pulse_hrms_jobs';
  private readonly CANDIDATES_KEY = 'pulse_hrms_candidates';
  private readonly GOALS_KEY = 'pulse_hrms_goals';
  private readonly PUNCH_KEY = 'pulse_hrms_punch_state';
  private readonly DEPARTMENTS_KEY = 'pulse_hrms_departments';

  // Signals
  readonly companies = signal<CompanyProfile[]>([]);
  readonly employees = signal<Employee[]>([]);
  readonly departments = signal<Department[]>(this.loadInitialDepartments());
  readonly designations = signal<Designation[]>(this.getInitialDesignations());
  readonly attendanceRecords = signal<AttendanceRecord[]>(this.loadInitialAttendance());
  readonly leaveRequests = signal<LeaveRequest[]>(this.loadInitialLeaves());
  readonly holidays = signal<Holiday[]>(this.getInitialHolidays());
  readonly payslips = signal<Payslip[]>(this.loadInitialPayslips());
  readonly jobPostings = signal<JobPosting[]>(this.loadInitialJobs());
  readonly candidates = signal<Candidate[]>(this.loadInitialCandidates());
  readonly goals = signal<Goal[]>(this.loadInitialGoals());
  readonly announcements = signal<Announcement[]>(this.getInitialAnnouncements());
  readonly companyProfile = signal<CompanyProfile | undefined>(undefined);

  // Punch in/out state for current user
  readonly punchState = signal<DailyPunchState>(this.loadInitialPunchState());

  // Computed signals
  readonly activeCompany = computed(() => this.companies().find(c => c.isDefault) || this.companies()[0]);
  readonly totalEmployees = computed(() => this.employees().length);
  readonly activeEmployeesCount = computed(() => this.employees().filter(e => e.status === 'Active').length);
  readonly onLeaveEmployeesCount = computed(() => this.employees().filter(e => e.status === 'On Leave').length);

  readonly todayAttendance = computed(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.attendanceRecords().filter(a => a.date === todayStr);
  });

  readonly presentTodayCount = computed(() => {
    return this.todayAttendance().filter(a => a.status === 'Present' || a.status === 'Late').length;
  });

  readonly pendingLeaveRequests = computed(() => {
    return this.leaveRequests().filter(l => l.status === 'Pending');
  });

  readonly activeJobOpeningsCount = computed(() => {
    return this.jobPostings().filter(j => j.status === 'Active').length;
  });

  readonly totalPayrollBudget = computed(() => {
    return this.employees().reduce((acc, emp) => acc + (emp.salary || 0), 0);
  });

  constructor() {
    this.loadCompaniesFromDatabase();
    this.loadEmployeesFromDatabase();

    // Sync to local storage on changes
    effect(() => {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('pulse_hrms_companies');
        localStorage.removeItem('pulse_hrms_employees');
        localStorage.setItem(this.DEPARTMENTS_KEY, JSON.stringify(this.departments()));
        localStorage.setItem(this.ATTENDANCE_KEY, JSON.stringify(this.attendanceRecords()));
        localStorage.setItem(this.LEAVES_KEY, JSON.stringify(this.leaveRequests()));
        localStorage.setItem(this.PAYROLL_KEY, JSON.stringify(this.payslips()));
        localStorage.setItem(this.JOBS_KEY, JSON.stringify(this.jobPostings()));
        localStorage.setItem(this.CANDIDATES_KEY, JSON.stringify(this.candidates()));
        localStorage.setItem(this.GOALS_KEY, JSON.stringify(this.goals()));
        localStorage.setItem(this.PUNCH_KEY, JSON.stringify(this.punchState()));
      }
    });
  }

  private loadCompaniesFromDatabase(): void {
    this.http.get<ApiResponse<CompanyProfile[]>>(this.COMPANIES_API_URL).subscribe({
      next: response => this.companies.set(response.data || []),
      error: error => {
        console.error('Unable to load companies from database:', error);
        this.companies.set([]);
      }
    });
  }

  private loadEmployeesFromDatabase(): void {
    this.employeeApi.getEmployees().subscribe({
      next: employees => this.employees.set(employees),
      error: error => {
        console.error('Unable to load employees from database:', error);
        this.employees.set([]);
      }
    });
  }

  setCompanies(companies: CompanyProfile[]): void {
    this.companies.set(companies);
  }

  setEmployees(employees: Employee[]): void {
    this.employees.set(employees);
  }

  // --- Department Actions ---
  addDepartment(dept: Omit<Department, 'id' | 'totalEmployees'>): Department {
    const newDept: Department = {
      ...dept,
      id: 'DEP-' + (100 + this.departments().length + 1),
      totalEmployees: 0
    };
    this.departments.update(list => [newDept, ...list]);

    // Update totalDepartments count in company
    this.companies.update(comps =>
      comps.map(c => c.id === dept.companyId ? { ...c, totalDepartments: c.totalDepartments + 1 } : c)
    );

    return newDept;
  }

  deleteDepartment(id: string): void {
    const target = this.departments().find(d => d.id === id);
    if (target) {
      this.departments.update(list => list.filter(d => d.id !== id));
      this.companies.update(comps =>
        comps.map(c => c.id === target.companyId ? { ...c, totalDepartments: Math.max(0, c.totalDepartments - 1) } : c)
      );
    }
  }

  // --- Employee Actions ---
  addEmployee(employee: Omit<Employee, 'id'>): Employee {
    const newEmp: Employee = {
      ...employee,
      id: 'EMP-' + (1000 + this.employees().length + 1)
    };
    this.employees.update(list => [newEmp, ...list]);

    // Increment department employee count
    this.departments.update(depts =>
      depts.map(d => (d.name === employee.department && d.companyId === employee.companyId) ? { ...d, totalEmployees: d.totalEmployees + 1 } : d)
    );

    // Increment company employee count
    this.companies.update(comps =>
      comps.map(c => c.id === employee.companyId ? { ...c, totalEmployees: c.totalEmployees + 1 } : c)
    );

    return newEmp;
  }

  updateEmployee(id: string, updated: Partial<Employee>): void {
    this.employees.update(list => list.map(emp => (emp.id === id ? { ...emp, ...updated } : emp)));
  }

  deleteEmployee(id: string): void {
    const emp = this.employees().find(e => e.id === id);
    if (emp) {
      this.employees.update(list => list.filter(e => e.id !== id));
      this.departments.update(depts =>
        depts.map(d => (d.name === emp.department && d.companyId === emp.companyId) ? { ...d, totalEmployees: Math.max(0, d.totalEmployees - 1) } : d)
      );
      this.companies.update(comps =>
        comps.map(c => c.id === emp.companyId ? { ...c, totalEmployees: Math.max(0, c.totalEmployees - 1) } : c)
      );
    }
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.employees().find(e => e.id === id);
  }

  // --- Punch In / Punch Out Actions ---
  clockIn(): void {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toISOString().split('T')[0];

    this.punchState.set({
      isClockedIn: true,
      clockInTime: timeStr,
      elapsedSeconds: 0
    });

    // Check if record exists for today
    const existing = this.attendanceRecords().find(a => a.employeeId === 'EMP-1001' && a.date === dateStr);
    if (!existing) {
      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
      const newRecord: AttendanceRecord = {
        id: 'ATT-' + Date.now(),
        employeeId: 'EMP-1001',
        employeeName: 'Jitendra Shukla',
        date: dateStr,
        clockIn: timeStr,
        workHours: 0,
        status: isLate ? 'Late' : 'Present'
      };
      this.attendanceRecords.update(records => [newRecord, ...records]);
    }
  }

  clockOut(): void {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toISOString().split('T')[0];

    const currentPunch = this.punchState();
    let hoursWorked = 8.5;
    if (currentPunch.clockInTime) {
      const [inH, inM] = currentPunch.clockInTime.split(':').map(Number);
      const hours = now.getHours() - inH + (now.getMinutes() - inM) / 60;
      hoursWorked = Math.max(0.5, parseFloat(hours.toFixed(1)));
    }

    this.punchState.set({
      isClockedIn: false,
      clockInTime: null,
      elapsedSeconds: 0
    });

    this.attendanceRecords.update(records =>
      records.map(r => {
        if (r.employeeId === 'EMP-1001' && r.date === dateStr) {
          return {
            ...r,
            clockOut: timeStr,
            workHours: hoursWorked,
            status: hoursWorked < 4 ? 'Half Day' : r.status
          };
        }
        return r;
      })
    );
  }

  // --- Leave Actions ---
  applyLeave(request: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>): LeaveRequest {
    const newLeave: LeaveRequest = {
      ...request,
      id: 'LV-' + (100 + this.leaveRequests().length + 1),
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };
    this.leaveRequests.update(list => [newLeave, ...list]);
    return newLeave;
  }

  updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected', comments?: string): void {
    this.leaveRequests.update(list =>
      list.map(l => (l.id === leaveId ? { ...l, status, approverComments: comments || l.approverComments } : l))
    );
  }

  // --- Recruitment Actions ---
  updateCandidateStage(candidateId: string, stage: Candidate['stage']): void {
    this.candidates.update(list => list.map(c => (c.id === candidateId ? { ...c, stage } : c)));
  }

  addJobPosting(job: Omit<JobPosting, 'id' | 'applicantsCount' | 'postedDate'>): JobPosting {
    const newJob: JobPosting = {
      ...job,
      id: 'JOB-' + (100 + this.jobPostings().length + 1),
      applicantsCount: 0,
      postedDate: new Date().toISOString().split('T')[0]
    };
    this.jobPostings.update(list => [newJob, ...list]);
    return newJob;
  }

  addCandidate(candidate: Omit<Candidate, 'id' | 'appliedDate'>): Candidate {
    const newCand: Candidate = {
      ...candidate,
      id: 'CAND-' + (1000 + this.candidates().length + 1),
      appliedDate: new Date().toISOString().split('T')[0]
    };
    this.candidates.update(list => [newCand, ...list]);
    // increment job applicants count
    this.jobPostings.update(list =>
      list.map(j => (j.id === candidate.jobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j))
    );
    return newCand;
  }

  // --- Goals / Performance Actions ---
  updateGoalProgress(goalId: string, progress: number): void {
    this.goals.update(list =>
      list.map(g => {
        if (g.id === goalId) {
          const status = progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';
          return { ...g, progressPercent: progress, status };
        }
        return g;
      })
    );
  }

  addGoal(goal: Omit<Goal, 'id'>): Goal {
    const newGoal: Goal = {
      ...goal,
      id: 'GOL-' + (100 + this.goals().length + 1)
    };
    this.goals.update(list => [newGoal, ...list]);
    return newGoal;
  }

  // --- Company / Multi-Entity Management Actions ---
  addCompany(company: Omit<CompanyProfile, 'id' | 'code' | 'totalEmployees' | 'totalDepartments'>): CompanyProfile {
    const codeNum = (this.companies().length + 1).toString().padStart(3, '0');
    const newCompany: CompanyProfile = {
      ...company,
      id: 'CMP-' + (100 + this.companies().length + 1),
      code: 'CORP-' + codeNum,
      totalEmployees: 0,
      totalDepartments: 1,
      isDefault: this.companies().length === 0 ? true : (company.isDefault || false)
    };

    if (newCompany.isDefault) {
      this.companies.update(list => list.map(c => ({ ...c, isDefault: false })));
    }

    this.companies.update(list => [newCompany, ...list]);
    return newCompany;
  }

  updateCompany(id: string, updated: Partial<CompanyProfile>): void {
    this.companies.update(list =>
      list.map(c => {
        if (c.id === id) {
          const merged = { ...c, ...updated };
          return merged;
        }
        if (updated.isDefault) {
          return { ...c, isDefault: false };
        }
        return c;
      })
    );
  }

  deleteCompany(id: string): void {
    const remaining = this.companies().filter(c => c.id !== id);
    if (remaining.length > 0 && !remaining.some(c => c.isDefault)) {
      remaining[0].isDefault = true;
    }
    this.companies.set(remaining);
  }

  setDefaultCompany(id: string): void {
    this.companies.update(list =>
      list.map(c => ({ ...c, isDefault: c.id === id }))
    );
  }

  // --- Seed Data Loaders ---
  private loadInitialEmployees(): Employee[] {
    return [
      {
        id: 'EMP-1001',
        companyId: 'CMP-101',
        companyName: 'Pulse Technologies India Pvt Ltd',
        employeeCode: 'EMP001',
        firstName: 'Jitendra',
        lastName: 'Shukla',
        email: 'jitendra.shukla@pulsehrms.com',
        phone: '+91 98765 43210',
        department: 'Engineering',
        designation: 'Principal Architect & Tech Lead',
        joinDate: '2022-01-15',
        employmentType: 'Full-Time',
        status: 'Active',
        salary: 185000,
        managerName: 'CEO Office',
        location: 'Bengaluru, India',
        address: {
          street: '124 Innovation Blvd, Tech Park',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560100',
          country: 'India'
        },
        emergencyContact: {
          name: 'Rashmi Shukla',
          relationship: 'Spouse',
          phone: '+91 98765 43211'
        },
        bankDetails: {
          accountNumber: '91802003891238',
          bankName: 'HDFC Bank Ltd',
          ifscCode: 'HDFC0001234',
          pan: 'ABCDE1234F'
        }
      },
      {
        id: 'EMP-1002',
        companyId: 'CMP-101',
        companyName: 'Pulse Technologies India Pvt Ltd',
        employeeCode: 'EMP002',
        firstName: 'Ananya',
        lastName: 'Sharma',
        email: 'ananya.sharma@pulsehrms.com',
        phone: '+91 98234 56789',
        department: 'Product & Design',
        designation: 'Head of Product Design',
        joinDate: '2022-04-10',
        employmentType: 'Full-Time',
        status: 'Active',
        salary: 160000,
        managerName: 'Jitendra Shukla',
        location: 'Bengaluru, India'
      },
      {
        id: 'EMP-1003',
        companyId: 'CMP-101',
        companyName: 'Pulse Technologies India Pvt Ltd',
        employeeCode: 'EMP003',
        firstName: 'Vikram',
        lastName: 'Patel',
        email: 'vikram.patel@pulsehrms.com',
        phone: '+91 97123 45678',
        department: 'Engineering',
        designation: 'Senior Frontend Engineer',
        joinDate: '2023-02-01',
        employmentType: 'Full-Time',
        status: 'Active',
        salary: 135000,
        managerName: 'Jitendra Shukla',
        location: 'Mumbai, India'
      },
      {
        id: 'EMP-1004',
        companyId: 'CMP-101',
        companyName: 'Pulse Technologies India Pvt Ltd',
        employeeCode: 'EMP004',
        firstName: 'Priya',
        lastName: 'Nair',
        email: 'priya.nair@pulsehrms.com',
        phone: '+91 96543 21098',
        department: 'Human Resources',
        designation: 'VP of People & Culture',
        joinDate: '2021-08-15',
        employmentType: 'Full-Time',
        status: 'Active',
        salary: 170000,
        managerName: 'CEO Office',
        location: 'Bengaluru, India'
      },
      {
        id: 'EMP-1005',
        companyId: 'CMP-101',
        companyName: 'Pulse Technologies India Pvt Ltd',
        employeeCode: 'EMP005',
        firstName: 'Rohan',
        lastName: 'Deshmukh',
        email: 'rohan.deshmukh@pulsehrms.com',
        phone: '+91 95432 10987',
        department: 'Engineering',
        designation: 'Staff Backend Engineer',
        joinDate: '2022-09-01',
        employmentType: 'Full-Time',
        status: 'On Leave',
        salary: 145000,
        managerName: 'Jitendra Shukla',
        location: 'Pune, India'
      },
      {
        id: 'EMP-1006',
        companyId: 'CMP-101',
        companyName: 'Pulse Technologies India Pvt Ltd',
        employeeCode: 'EMP006',
        firstName: 'Sneha',
        lastName: 'Reddy',
        email: 'sneha.reddy@pulsehrms.com',
        phone: '+91 94321 09876',
        department: 'Finance',
        designation: 'Director of Finance',
        joinDate: '2021-11-20',
        employmentType: 'Full-Time',
        status: 'Active',
        salary: 165000,
        managerName: 'CEO Office',
        location: 'Hyderabad, India'
      },
      {
        id: 'EMP-1007',
        companyId: 'CMP-102',
        companyName: 'Pulse Cloud Solutions Mumbai Ltd',
        employeeCode: 'EMP007',
        firstName: 'Arjun',
        lastName: 'Kapoor',
        email: 'arjun.kapoor@pulsehrms.com',
        phone: '+91 93210 98765',
        department: 'Sales & Marketing',
        designation: 'Enterprise Growth Manager',
        joinDate: '2023-05-15',
        employmentType: 'Full-Time',
        status: 'Active',
        salary: 120000,
        managerName: 'Priya Nair',
        location: 'Mumbai, India'
      },
      {
        id: 'EMP-1008',
        companyId: 'CMP-102',
        companyName: 'Pulse Cloud Solutions Mumbai Ltd',
        employeeCode: 'EMP008',
        firstName: 'Meera',
        lastName: 'Iyer',
        email: 'meera.iyer@pulsehrms.com',
        phone: '+91 92109 87654',
        department: 'FinTech Cloud Operations',
        designation: 'DevOps & Cloud Specialist',
        joinDate: '2023-08-01',
        employmentType: 'Full-Time',
        status: 'Active',
        salary: 130000,
        managerName: 'Jitendra Shukla',
        location: 'Mumbai, India'
      },
      {
        id: 'EMP-1009',
        companyId: 'CMP-103',
        companyName: 'Pulse Global Pte. Ltd.',
        employeeCode: 'EMP009',
        firstName: 'Karan',
        lastName: 'Mehta',
        email: 'karan.mehta@pulsehrms.com',
        phone: '+91 91098 76543',
        department: 'APAC Client Solutions',
        designation: 'Senior Product Manager',
        joinDate: '2023-10-10',
        employmentType: 'Full-Time',
        status: 'Active',
        salary: 140000,
        managerName: 'Ananya Sharma',
        location: 'Singapore'
      },
      {
        id: 'EMP-1010',
        companyId: 'CMP-103',
        companyName: 'Pulse Global Pte. Ltd.',
        employeeCode: 'EMP010',
        firstName: 'Divya',
        lastName: 'Choudhary',
        email: 'divya.c@pulsehrms.com',
        phone: '+91 90987 65432',
        department: 'APAC Client Solutions',
        designation: 'Talent Acquisition Partner',
        joinDate: '2024-01-15',
        employmentType: 'Full-Time',
        status: 'Active',
        salary: 85000,
        managerName: 'Priya Nair',
        location: 'Singapore'
      }
    ];
  }

  private loadInitialDepartments(): Department[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.DEPARTMENTS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return [
      { id: 'DEP-1', companyId: 'CMP-101', name: 'Engineering', code: 'ENG', headOfDepartment: 'Jitendra Shukla', totalEmployees: 3, color: '#6366f1' },
      { id: 'DEP-2', companyId: 'CMP-101', name: 'Product & Design', code: 'PRD', headOfDepartment: 'Ananya Sharma', totalEmployees: 1, color: '#8b5cf6' },
      { id: 'DEP-3', companyId: 'CMP-101', name: 'Human Resources', code: 'HR', headOfDepartment: 'Priya Nair', totalEmployees: 1, color: '#ec4899' },
      { id: 'DEP-4', companyId: 'CMP-101', name: 'Finance', code: 'FIN', headOfDepartment: 'Sneha Reddy', totalEmployees: 1, color: '#10b981' },
      { id: 'DEP-5', companyId: 'CMP-102', name: 'Sales & Marketing', code: 'SAL', headOfDepartment: 'Arjun Kapoor', totalEmployees: 1, color: '#f59e0b' },
      { id: 'DEP-6', companyId: 'CMP-102', name: 'FinTech Cloud Operations', code: 'OPS', headOfDepartment: 'Meera Iyer', totalEmployees: 1, color: '#0ea5e9' },
      { id: 'DEP-7', companyId: 'CMP-103', name: 'APAC Client Solutions', code: 'APAC', headOfDepartment: 'Karan Mehta', totalEmployees: 2, color: '#10b981' }
    ];
  }

  private getInitialDesignations(): Designation[] {
    return [
      { id: 'DES-1', title: 'Principal Architect & Tech Lead', department: 'Engineering', level: 'L6 - Principal' },
      { id: 'DES-2', title: 'Staff Backend Engineer', department: 'Engineering', level: 'L5 - Staff' },
      { id: 'DES-3', title: 'Senior Frontend Engineer', department: 'Engineering', level: 'L4 - Senior' },
      { id: 'DES-4', title: 'DevOps & Cloud Specialist', department: 'Engineering', level: 'L4 - Senior' },
      { id: 'DES-5', title: 'Head of Product Design', department: 'Product & Design', level: 'L6 - Director' },
      { id: 'DES-6', title: 'Senior Product Manager', department: 'Product & Design', level: 'L4 - Senior' },
      { id: 'DES-7', title: 'VP of People & Culture', department: 'Human Resources', level: 'L7 - Executive' },
      { id: 'DES-8', title: 'Talent Acquisition Partner', department: 'Human Resources', level: 'L3 - Mid' },
      { id: 'DES-9', title: 'Director of Finance', department: 'Finance', level: 'L6 - Director' },
      { id: 'DES-10', title: 'Enterprise Growth Manager', department: 'Sales & Marketing', level: 'L4 - Senior' }
    ];
  }

  private loadInitialAttendance(): AttendanceRecord[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.ATTENDANCE_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    const today = new Date().toISOString().split('T')[0];
    return [];
  }

  private loadInitialLeaves(): LeaveRequest[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.LEAVES_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return [];
  }

  private getInitialHolidays(): Holiday[] {
    return [
      { id: 'HOL-1', name: 'Independence Day', date: '2026-08-15', day: 'Saturday', type: 'Public' },
      { id: 'HOL-2', name: 'Ganesh Chaturthi', date: '2026-09-14', day: 'Monday', type: 'Public' },
      { id: 'HOL-3', name: 'Mahatma Gandhi Jayanti', date: '2026-10-02', day: 'Friday', type: 'Public' },
      { id: 'HOL-4', name: 'Dussehra (Vijayadashami)', date: '2026-10-20', day: 'Tuesday', type: 'Public' },
      { id: 'HOL-5', name: 'Diwali (Deepavali)', date: '2026-11-08', day: 'Sunday', type: 'Public' },
      { id: 'HOL-6', name: 'Christmas Day', date: '2026-12-25', day: 'Friday', type: 'Public' }
    ];
  }

  private loadInitialPayslips(): Payslip[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.PAYROLL_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return [
      {
        id: 'PAY-202607-001',
        payrollMonth: 'July 2026',
        employeeId: 'EMP-1001',
        employeeName: 'Jitendra Shukla',
        employeeCode: 'EMP001',
        designation: 'Principal Architect & Tech Lead',
        department: 'Engineering',
        bankAccount: '91802003891238',
        pan: 'ABCDE1234F',
        workingDays: 22,
        paidDays: 22,
        lossOfPayDays: 0,
        basicSalary: 92500,
        hra: 46250,
        specialAllowance: 27750,
        conveyanceAllowance: 8500,
        medicalAllowance: 5000,
        performanceBonus: 5000,
        grossEarnings: 185000,
        providentFund: 11100,
        professionalTax: 200,
        taxDeductedAtSource: 21500,
        healthInsurance: 2200,
        totalDeductions: 35000,
        netSalary: 150000,
        paymentStatus: 'Paid',
        paymentDate: '2026-07-31'
      },
      {
        id: 'PAY-202607-002',
        payrollMonth: 'July 2026',
        employeeId: 'EMP-1002',
        employeeName: 'Ananya Sharma',
        employeeCode: 'EMP002',
        designation: 'Head of Product Design',
        department: 'Product & Design',
        bankAccount: '91802003895512',
        pan: 'BCDEF2345G',
        workingDays: 22,
        paidDays: 22,
        lossOfPayDays: 0,
        basicSalary: 80000,
        hra: 40000,
        specialAllowance: 24000,
        conveyanceAllowance: 8000,
        medicalAllowance: 4000,
        performanceBonus: 4000,
        grossEarnings: 160000,
        providentFund: 9600,
        professionalTax: 200,
        taxDeductedAtSource: 17200,
        healthInsurance: 2000,
        totalDeductions: 29000,
        netSalary: 131000,
        paymentStatus: 'Paid',
        paymentDate: '2026-07-31'
      },
      {
        id: 'PAY-202607-003',
        payrollMonth: 'July 2026',
        employeeId: 'EMP-1003',
        employeeName: 'Vikram Patel',
        employeeCode: 'EMP003',
        designation: 'Senior Frontend Engineer',
        department: 'Engineering',
        bankAccount: '91802003896677',
        pan: 'CDEFG3456H',
        workingDays: 22,
        paidDays: 22,
        lossOfPayDays: 0,
        basicSalary: 67500,
        hra: 33750,
        specialAllowance: 20250,
        conveyanceAllowance: 7500,
        medicalAllowance: 3000,
        performanceBonus: 3000,
        grossEarnings: 135000,
        providentFund: 8100,
        professionalTax: 200,
        taxDeductedAtSource: 12700,
        healthInsurance: 2000,
        totalDeductions: 23000,
        netSalary: 112000,
        paymentStatus: 'Paid',
        paymentDate: '2026-07-31'
      }
    ];
  }

  private loadInitialJobs(): JobPosting[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.JOBS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return [
      {
        id: 'JOB-101',
        title: 'Senior Angular & TypeScript Engineer',
        department: 'Engineering',
        location: 'Bengaluru / Hybrid',
        type: 'Full-Time',
        openings: 3,
        applicantsCount: 14,
        experienceRange: '4 - 7 Years',
        salaryRange: '₹18L - ₹28L PA',
        status: 'Active',
        postedDate: '2026-08-01',
        description: 'Lead modern reactive frontend architectures using Angular 19, Signals, and enterprise microfrontends.'
      },
      {
        id: 'JOB-102',
        title: 'Senior Product Designer (UI/UX)',
        department: 'Product & Design',
        location: 'Bengaluru / Remote',
        type: 'Full-Time',
        openings: 1,
        applicantsCount: 8,
        experienceRange: '3 - 6 Years',
        salaryRange: '₹16L - ₹24L PA',
        status: 'Active',
        postedDate: '2026-08-05',
        description: 'Shape the next-generation enterprise SaaS design language, design systems, and delightful workflows.'
      },
      {
        id: 'JOB-103',
        title: 'Cloud Infrastructure & SRE Specialist',
        department: 'Engineering',
        location: 'Remote',
        type: 'Full-Time',
        openings: 2,
        applicantsCount: 6,
        experienceRange: '5 - 8 Years',
        salaryRange: '₹22L - ₹32L PA',
        status: 'Active',
        postedDate: '2026-08-10',
        description: 'Architect resilient Kubernetes clusters, automated CI/CD pipelines, and observability monitoring.'
      },
      {
        id: 'JOB-104',
        title: 'HR Business Partner',
        department: 'Human Resources',
        location: 'Bengaluru',
        type: 'Full-Time',
        openings: 1,
        applicantsCount: 11,
        experienceRange: '3 - 5 Years',
        salaryRange: '₹12L - ₹16L PA',
        status: 'Active',
        postedDate: '2026-08-12',
        description: 'Partner with engineering and product leaders on talent management, onboarding, and culture initiatives.'
      }
    ];
  }

  private loadInitialCandidates(): Candidate[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.CANDIDATES_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return [
      {
        id: 'CAND-1001',
        jobId: 'JOB-101',
        jobTitle: 'Senior Angular & TypeScript Engineer',
        name: 'Rahul Verma',
        email: 'rahul.verma@gmail.com',
        phone: '+91 98111 22233',
        experienceYears: 5.5,
        currentCompany: 'Infosys',
        appliedDate: '2026-08-02',
        stage: 'Interview',
        rating: 5,
        notes: 'Passed technical round with flying colors. Deep knowledge of Angular Signals & RxJS.'
      },
      {
        id: 'CAND-1002',
        jobId: 'JOB-101',
        jobTitle: 'Senior Angular & TypeScript Engineer',
        name: 'Pooja Hegde',
        email: 'pooja.hegde@outlook.com',
        phone: '+91 98222 33344',
        experienceYears: 6,
        currentCompany: 'Accenture',
        appliedDate: '2026-08-03',
        stage: 'Offered',
        rating: 5,
        notes: 'Offer letter dispatched. Joining in 30 days.'
      },
      {
        id: 'CAND-1003',
        jobId: 'JOB-102',
        jobTitle: 'Senior Product Designer (UI/UX)',
        name: 'Aditya Sen',
        email: 'aditya.sen@designcraft.io',
        phone: '+91 98333 44455',
        experienceYears: 4,
        currentCompany: 'DesignStudio',
        appliedDate: '2026-08-06',
        stage: 'Screening',
        rating: 4,
        notes: 'Great Figma portfolio with clean design tokens.'
      },
      {
        id: 'CAND-1004',
        jobId: 'JOB-103',
        jobTitle: 'Cloud Infrastructure & SRE Specialist',
        name: 'Suresh Kumar',
        email: 'suresh.k@cloudtech.com',
        phone: '+91 98444 55566',
        experienceYears: 7,
        currentCompany: 'Wipro',
        appliedDate: '2026-08-11',
        stage: 'Applied',
        rating: 3,
        notes: 'AWS and Terraform certified.'
      }
    ];
  }

  private loadInitialGoals(): Goal[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.GOALS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return [
      {
        id: 'GOL-101',
        employeeId: 'EMP-1001',
        employeeName: 'Jitendra Shukla',
        title: 'Architect PulseHRMS Angular 19 Core Microservices',
        description: 'Complete the enterprise standalone component migration and state synchronization layer.',
        category: 'Strategic',
        priority: 'High',
        status: 'In Progress',
        progressPercent: 85,
        dueDate: '2026-09-30',
        assignedBy: 'Executive Team'
      },
      {
        id: 'GOL-102',
        employeeId: 'EMP-1002',
        employeeName: 'Ananya Sharma',
        title: 'Design System 2.0 & Accessibility Audit',
        description: 'Standardize WCAG 2.1 AA compliant color contrasts and responsive UI token library.',
        category: 'Operational',
        priority: 'High',
        status: 'In Progress',
        progressPercent: 70,
        dueDate: '2026-09-15',
        assignedBy: 'Jitendra Shukla'
      },
      {
        id: 'GOL-103',
        employeeId: 'EMP-1003',
        employeeName: 'Vikram Patel',
        title: 'Optimize Bundle Size & Web Vitals',
        description: 'Achieve sub-second LCP and 95+ Google Lighthouse Performance rating.',
        category: 'Learning',
        priority: 'Medium',
        status: 'In Progress',
        progressPercent: 60,
        dueDate: '2026-08-31',
        assignedBy: 'Jitendra Shukla'
      },
      {
        id: 'GOL-104',
        employeeId: 'EMP-1004',
        employeeName: 'Priya Nair',
        title: 'Q3 Global Talent Acquisition Drive',
        description: 'Source, interview, and close 8 key senior technical engineering roles.',
        category: 'Strategic',
        priority: 'High',
        status: 'Completed',
        progressPercent: 100,
        dueDate: '2026-08-15',
        assignedBy: 'Executive Team'
      }
    ];
  }

  private getInitialAnnouncements(): Announcement[] {
    return [
      {
        id: 'ANN-1',
        title: '🎉 Q2 All-Hands Meeting & High Achiever Awards',
        content: 'Join us this Friday at 4:00 PM IST in the Town Hall auditorium and virtual stream for celebrating our quarterly milestones.',
        date: '2026-08-20',
        author: 'Priya Nair (VP People)',
        category: 'Celebration',
        priority: 'Normal'
      },
      {
        id: 'ANN-2',
        title: '🚀 PulseHRMS 3.0 Platform Upgrade Live',
        content: 'We have deployed the latest Angular 19 reactive performance enhancements, mobile responsiveness, and instant payslip downloads.',
        date: '2026-08-18',
        author: 'Jitendra Shukla (Tech Lead)',
        category: 'Update',
        priority: 'Normal'
      },
      {
        id: 'ANN-3',
        title: '🛡️ Annual Health Insurance Policy Renewals',
        content: 'Please verify your registered dependents and policy nominee details in the employee profile before end of month.',
        date: '2026-08-12',
        author: 'Sneha Reddy (Finance)',
        category: 'Policy',
        priority: 'Urgent'
      }
    ];
  }

  private loadInitialCompanies(): CompanyProfile[] {
    return [
      {
        id: 'CMP-101',
        code: 'CORP-001',
        companyName: 'Pulse Technologies India Pvt Ltd',
        tagline: 'Empowering Next-Gen Workforce Intelligence',
        industry: 'Enterprise Software & Cloud SaaS',
        type: 'Headquarters',
        status: 'Active',
        website: 'https://pulsehrms.enterprise.io',
        taxId: '29ABCDE1234F1Z5',
        registrationNumber: 'U72200KA2021PTC145000',
        phone: '+91 (80) 4123-8900',
        email: 'hq@pulsehrms.enterprise.io',
        address: 'Tower 4, Level 9, Cyber Crown Tech Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560100',
        country: 'India',
        currency: 'INR (₹)',
        timeZone: 'Asia/Kolkata (IST +5:30)',
        totalEmployees: 10,
        totalDepartments: 5,
        isDefault: true,
        brandColor: '#6366f1',
        establishedDate: '2021-04-10'
      },
      {
        id: 'CMP-102',
        code: 'CORP-002',
        companyName: 'Pulse Cloud Solutions Mumbai Ltd',
        tagline: 'Financial & Banking Cloud Infrastructure',
        industry: 'FinTech & Cloud Engineering',
        type: 'Regional Branch',
        status: 'Active',
        website: 'https://mumbai.pulsehrms.io',
        taxId: '27AABCD9876E1Z2',
        registrationNumber: 'U72200MH2022PTC288000',
        phone: '+91 (22) 6789-0123',
        email: 'mumbai@pulsehrms.enterprise.io',
        address: 'One BKC, Bandra Kurla Complex',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400051',
        country: 'India',
        currency: 'INR (₹)',
        timeZone: 'Asia/Kolkata (IST +5:30)',
        totalEmployees: 3,
        totalDepartments: 2,
        isDefault: false,
        brandColor: '#0ea5e9',
        establishedDate: '2022-08-15'
      },
      {
        id: 'CMP-103',
        code: 'CORP-003',
        companyName: 'Pulse Global Pte. Ltd.',
        tagline: 'APAC Innovation & Global Client Services',
        industry: 'International SaaS Consulting',
        type: 'Subsidiary',
        status: 'Active',
        website: 'https://global.pulsehrms.io',
        taxId: 'SG-202309188M',
        registrationNumber: 'UEN202309188M',
        phone: '+65 6789 4321',
        email: 'apac@pulsehrms.enterprise.io',
        address: '10 Marina Boulevard, Marina Bay Financial Centre',
        city: 'Singapore',
        state: 'Central Region',
        zipCode: '018983',
        country: 'Singapore',
        currency: 'USD ($)',
        timeZone: 'Asia/Singapore (SGT +8:00)',
        totalEmployees: 2,
        totalDepartments: 2,
        isDefault: false,
        brandColor: '#10b981',
        establishedDate: '2023-11-01'
      }
    ];
  }

  private getInitialCompanyProfile(): CompanyProfile {
    return this.loadInitialCompanies()[0];
  }

  private loadInitialPunchState(): DailyPunchState {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.PUNCH_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return {
      isClockedIn: true,
      clockInTime: '09:12:00',
      elapsedSeconds: 21600 // 6 hours default active
    };
  }
}
