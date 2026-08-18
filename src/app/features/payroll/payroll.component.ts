import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrmsDataService } from '../../core/services/hrms-data.service';
import { Payslip } from '../../core/models/payroll.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent, StatCardComponent, ModalComponent],
  template: `
    <div class="payroll-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-titles">
          <h1>Payroll & Compensation</h1>
          <p>Monthly salary runs, tax deductions, compensation structures, and payslips.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-secondary" (click)="generatePayrollRun()">
            <app-icon name="dollar-sign" [size]="18"></app-icon>
            <span>Run Monthly Payroll</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid-4">
        <app-stat-card
          title="Total Gross Payout"
          [value]="'₹' + (totalGross() / 100000).toFixed(2) + ' L'"
          icon="dollar-sign"
          accentColor="var(--primary-500)"
          iconBg="var(--primary-50)"
          trend="July 2026 Cycle"
        ></app-stat-card>

        <app-stat-card
          title="Net Take-Home"
          [value]="'₹' + (totalNet() / 100000).toFixed(2) + ' L'"
          icon="check-circle"
          accentColor="var(--success-500)"
          iconBg="var(--success-50)"
          subtitle="Direct Bank Transfer"
        ></app-stat-card>

        <app-stat-card
          title="Taxes & PF Deductions"
          [value]="'₹' + (totalDeductions() / 1000).toFixed(0) + ' K'"
          icon="award"
          accentColor="var(--warning-500)"
          iconBg="var(--warning-50)"
          subtitle="PF, PT & TDS"
        ></app-stat-card>

        <app-stat-card
          title="Employees Processed"
          [value]="payslips().length"
          icon="users"
          accentColor="var(--accent-purple)"
          iconBg="rgba(139, 92, 246, 0.1)"
          trend="100% Disbursed"
          trendType="up"
        ></app-stat-card>
      </div>

      <!-- Payslips Table -->
      <div class="card">
        <div class="flex-between mb-4">
          <div>
            <h3 class="section-title">Salary Statements & Payslips</h3>
            <span class="text-muted font-xs">View detailed breakdown or print individual salary slips</span>
          </div>

          <div class="search-box">
            <input 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="Search employee or ID..." 
              [ngModel]="searchQuery()" 
              (ngModelChange)="searchQuery.set($event)"
            />
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Designation</th>
                <th>Month</th>
                <th>Gross Earnings</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (pay of filteredPayslips(); track pay.id) {
                <tr>
                  <td>
                    <div class="flex-align gap-2">
                      <div class="avatar avatar-sm">{{ pay.employeeName[0] }}</div>
                      <div>
                        <div class="font-bold">{{ pay.employeeName }}</div>
                        <div class="text-muted font-xs">{{ pay.employeeCode }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ pay.designation }}</td>
                  <td><strong>{{ pay.payrollMonth }}</strong></td>
                  <td class="font-mono font-bold">₹{{ pay.grossEarnings.toLocaleString() }}</td>
                  <td class="font-mono text-danger">₹{{ pay.totalDeductions.toLocaleString() }}</td>
                  <td class="font-mono font-bold text-success">₹{{ pay.netSalary.toLocaleString() }}</td>
                  <td><app-badge variant="success" [label]="pay.paymentStatus"></app-badge></td>
                  <td>
                    <div class="flex-align gap-2 justify-end">
                      <button type="button" class="btn btn-sm btn-outline" (click)="openPayslipModal(pay)">
                        <app-icon name="eye" [size]="16"></app-icon>
                        <span>View Payslip</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payslip Preview Modal -->
      @if (selectedPayslip(); as ps) {
        <app-modal
          [isOpen]="isModalOpen()"
          title="Employee Salary Slip"
          size="lg"
          (close)="isModalOpen.set(false)">
          
          <div class="payslip-document" id="printable-payslip">
            <!-- Company Header -->
            <div class="payslip-header">
              <div class="company-brand">
                <h2>PULSE TECHNOLOGIES INDIA PVT LTD</h2>
                <p>Tower 4, Level 9, Cyber Crown Tech Park, Bengaluru - 560100</p>
                <p class="font-mono">GST/PAN: 29ABCDE1234F1Z5 • TAN: BLRP12345E</p>
              </div>
              <div class="payslip-month-tag">
                <span>PAYSLIP FOR</span>
                <strong>{{ ps.payrollMonth }}</strong>
              </div>
            </div>

            <!-- Employee Info Grid -->
            <div class="payslip-emp-grid">
              <div class="emp-col">
                <div class="info-row"><span class="k">Employee Name:</span> <span class="v font-bold">{{ ps.employeeName }}</span></div>
                <div class="info-row"><span class="k">Employee ID:</span> <span class="v font-mono">{{ ps.employeeCode }}</span></div>
                <div class="info-row"><span class="k">Designation:</span> <span class="v">{{ ps.designation }}</span></div>
                <div class="info-row"><span class="k">Department:</span> <span class="v">{{ ps.department }}</span></div>
              </div>
              <div class="emp-col">
                <div class="info-row"><span class="k">Bank Account:</span> <span class="v font-mono">{{ ps.bankAccount }}</span></div>
                <div class="info-row"><span class="k">PAN Number:</span> <span class="v font-mono">{{ ps.pan }}</span></div>
                <div class="info-row"><span class="k">Paid Days:</span> <span class="v font-bold">{{ ps.paidDays }} of {{ ps.workingDays }} Days</span></div>
                <div class="info-row"><span class="k">Payment Mode:</span> <span class="v">Direct Bank Credit</span></div>
              </div>
            </div>

            <!-- Earnings vs Deductions Breakdown -->
            <div class="payslip-breakdown">
              <!-- Earnings -->
              <div class="breakdown-box">
                <div class="box-title">EARNINGS</div>
                <table class="breakdown-table">
                  <tr><td>Basic Salary</td><td class="num font-mono">₹{{ ps.basicSalary.toLocaleString() }}</td></tr>
                  <tr><td>House Rent Allowance (HRA)</td><td class="num font-mono">₹{{ ps.hra.toLocaleString() }}</td></tr>
                  <tr><td>Special Allowance</td><td class="num font-mono">₹{{ ps.specialAllowance.toLocaleString() }}</td></tr>
                  <tr><td>Conveyance Allowance</td><td class="num font-mono">₹{{ ps.conveyanceAllowance.toLocaleString() }}</td></tr>
                  <tr><td>Medical Allowance</td><td class="num font-mono">₹{{ ps.medicalAllowance.toLocaleString() }}</td></tr>
                  <tr><td>Performance Bonus</td><td class="num font-mono">₹{{ ps.performanceBonus.toLocaleString() }}</td></tr>
                  <tr class="total-row"><td><strong>Gross Earnings (A)</strong></td><td class="num font-mono font-bold">₹{{ ps.grossEarnings.toLocaleString() }}</td></tr>
                </table>
              </div>

              <!-- Deductions -->
              <div class="breakdown-box">
                <div class="box-title">DEDUCTIONS</div>
                <table class="breakdown-table">
                  <tr><td>Provident Fund (EPF)</td><td class="num font-mono">₹{{ ps.providentFund.toLocaleString() }}</td></tr>
                  <tr><td>Professional Tax (PT)</td><td class="num font-mono">₹{{ ps.professionalTax.toLocaleString() }}</td></tr>
                  <tr><td>Income Tax (TDS)</td><td class="num font-mono">₹{{ ps.taxDeductedAtSource.toLocaleString() }}</td></tr>
                  <tr><td>Group Health Insurance</td><td class="num font-mono">₹{{ ps.healthInsurance.toLocaleString() }}</td></tr>
                  <tr class="empty-row"><td colspan="2">&nbsp;</td></tr>
                  <tr class="empty-row"><td colspan="2">&nbsp;</td></tr>
                  <tr class="total-row"><td><strong>Total Deductions (B)</strong></td><td class="num font-mono font-bold text-danger">₹{{ ps.totalDeductions.toLocaleString() }}</td></tr>
                </table>
              </div>
            </div>

            <!-- Net Pay Highlight -->
            <div class="net-pay-banner">
              <div>
                <span class="net-label">Net Salary Payable (A - B):</span>
                <div class="net-amount font-mono">₹{{ ps.netSalary.toLocaleString() }}</div>
              </div>
              <span class="badge badge-success">Disbursed on {{ ps.paymentDate }}</span>
            </div>

            <div class="payslip-seal">
              <span class="seal-note">* This is a computer-generated official payroll slip and requires no physical signature.</span>
            </div>
          </div>

          <div modal-footer>
            <button type="button" class="btn btn-secondary" (click)="isModalOpen.set(false)">Close</button>
            <button type="button" class="btn btn-primary" (click)="printPayslip()">
              <app-icon name="printer" [size]="16"></app-icon>
              <span>Print / Download PDF</span>
            </button>
          </div>
        </app-modal>
      }
    </div>
  `,
  styles: [`
    .payroll-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .payslip-document {
      background: #ffffff;
      color: #0f172a;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-md);
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .payslip-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 1rem;

      .company-brand {
        h2 { font-size: 1.125rem; font-weight: 800; color: #0f172a; }
        p { font-size: 0.75rem; color: #64748b; margin-top: 0.125rem; }
      }

      .payslip-month-tag {
        text-align: right;
        display: flex;
        flex-direction: column;
        span { font-size: 0.6875rem; font-weight: 700; color: #64748b; }
        strong { font-size: 1rem; color: #4338ca; }
      }
    }

    .payslip-emp-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      background: #f8fafc;
      padding: 1rem;
      border-radius: var(--radius-sm);

      .info-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.8125rem;
        margin-bottom: 0.375rem;

        .k { color: #64748b; font-weight: 500; }
        .v { color: #0f172a; }
      }
    }

    .payslip-breakdown {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;

      .breakdown-box {
        border: 1px solid #e2e8f0;
        border-radius: var(--radius-sm);
        overflow: hidden;

        .box-title {
          background: #f1f5f9;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #e2e8f0;
          color: #334155;
        }

        .breakdown-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;

          td {
            padding: 0.5rem 0.75rem;
            border-bottom: 1px solid #f1f5f9;
          }

          .num { text-align: right; }
          .total-row {
            background: #f8fafc;
            border-top: 1px solid #cbd5e1;
            font-weight: 700;
          }
        }
      }
    }

    .net-pay-banner {
      background: linear-gradient(135deg, #eef2ff, #e0e7ff);
      border: 1px solid #c7d2fe;
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .net-label { font-size: 0.8125rem; font-weight: 600; color: #4338ca; }
      .net-amount { font-size: 1.5rem; font-weight: 800; color: #1e1b4b; }
    }

    .payslip-seal {
      text-align: center;
      .seal-note { font-size: 0.6875rem; color: #94a3b8; }
    }

    .section-title { font-size: 1.0625rem; font-weight: 700; color: var(--text-main); }
    .font-mono { font-family: var(--font-mono); }
    .font-bold { font-weight: 700; }
    .font-xs { font-size: 0.75rem; }
    .text-success { color: var(--success-600); }
    .text-danger { color: var(--danger-600); }
    .mb-4 { margin-bottom: 1rem; }
    .justify-end { justify-content: flex-end; }
  `]
})
export class PayrollComponent {
  private readonly hrmsData = inject(HrmsDataService);
  private readonly toast = inject(NotificationService);

  readonly payslips = this.hrmsData.payslips;
  readonly searchQuery = signal<string>('');
  readonly isModalOpen = signal<boolean>(false);
  readonly selectedPayslip = signal<Payslip | null>(null);

  readonly totalGross = computed(() => this.payslips().reduce((sum, p) => sum + p.grossEarnings, 0));
  readonly totalNet = computed(() => this.payslips().reduce((sum, p) => sum + p.netSalary, 0));
  readonly totalDeductions = computed(() => this.payslips().reduce((sum, p) => sum + p.totalDeductions, 0));

  readonly filteredPayslips = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.payslips();
    return this.payslips().filter(p =>
      p.employeeName.toLowerCase().includes(q) ||
      p.employeeCode.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q)
    );
  });

  openPayslipModal(ps: Payslip): void {
    this.selectedPayslip.set(ps);
    this.isModalOpen.set(true);
  }

  generatePayrollRun(): void {
    this.toast.success('Payroll Processed', 'Monthly salary computations and tax slips updated.');
  }

  printPayslip(): void {
    window.print();
  }
}
