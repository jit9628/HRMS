import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrmsDataService } from '../../core/services/hrms-data.service';
import { JobPosting, Candidate, CandidateStage } from '../../core/models/recruitment.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-recruitment',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent, StatCardComponent, ModalComponent],
  template: `
    <div class="recruitment-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-titles">
          <h1>Recruitment & Applicant Tracking (ATS)</h1>
          <p>Manage open positions, pipeline stages, interview assessments, and candidate offers.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-secondary" (click)="isCandidateModalOpen.set(true)">
            <app-icon name="user-plus" [size]="18"></app-icon>
            <span>Add Candidate</span>
          </button>
          <button type="button" class="btn btn-primary" (click)="isJobModalOpen.set(true)">
            <app-icon name="plus" [size]="18"></app-icon>
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      <!-- Quick KPI Stats -->
      <div class="grid-4">
        <app-stat-card
          title="Active Openings"
          [value]="activeJobsCount()"
          icon="briefcase"
          accentColor="var(--primary-500)"
          iconBg="var(--primary-50)"
        ></app-stat-card>

        <app-stat-card
          title="Total Applicants"
          [value]="candidates().length"
          icon="users"
          accentColor="var(--accent-purple)"
          iconBg="rgba(139, 92, 246, 0.1)"
          trend="+4 This week"
          trendType="up"
        ></app-stat-card>

        <app-stat-card
          title="Interviews In Progress"
          [value]="interviewCount()"
          icon="clock"
          accentColor="var(--warning-500)"
          iconBg="var(--warning-50)"
          subtitle="Round 2 / Technical"
        ></app-stat-card>

        <app-stat-card
          title="Offers Released"
          [value]="offeredCount()"
          icon="check-circle"
          accentColor="var(--success-500)"
          iconBg="var(--success-50)"
          subtitle="Awaiting acceptance"
        ></app-stat-card>
      </div>

      <!-- Navigation Tabs: Open Jobs vs Candidate Pipeline -->
      <div class="tabs-nav">
        <button class="tab-btn" [class.active]="activeTab() === 'pipeline'" (click)="activeTab.set('pipeline')">
          Candidate Pipeline Board
        </button>
        <button class="tab-btn" [class.active]="activeTab() === 'jobs'" (click)="activeTab.set('jobs')">
          Active Job Openings ({{ jobs().length }})
        </button>
      </div>

      <!-- View 1: Pipeline Kanban Columns -->
      @if (activeTab() === 'pipeline') {
        <div class="pipeline-board">
          @for (stage of stages; track stage) {
            <div class="pipeline-column">
              <div class="column-header">
                <span class="column-title">{{ stage }}</span>
                <span class="badge badge-neutral">{{ getCandidatesForStage(stage).length }}</span>
              </div>

              <div class="column-cards">
                @for (cand of getCandidatesForStage(stage); track cand.id) {
                  <div class="card cand-card card-hover">
                    <div class="cand-top">
                      <div class="flex-align gap-2">
                        <div class="avatar avatar-sm">{{ cand.name[0] }}</div>
                        <div>
                          <div class="cand-name">{{ cand.name }}</div>
                          <div class="cand-job font-xs">{{ cand.jobTitle }}</div>
                        </div>
                      </div>
                      <div class="cand-rating">⭐ {{ cand.rating }}/5</div>
                    </div>

                    <div class="cand-meta">
                      <span><app-icon name="briefcase" [size]="12"></app-icon> {{ cand.experienceYears }} yrs exp</span>
                      <span><app-icon name="mail" [size]="12"></app-icon> {{ cand.email }}</span>
                    </div>

                    @if (cand.notes) {
                      <div class="cand-notes">"{{ cand.notes }}"</div>
                    }

                    <!-- Move to next stage dropdown -->
                    <div class="cand-actions">
                      <select 
                        class="form-control form-control-sm stage-select" 
                        [ngModel]="cand.stage" 
                        (ngModelChange)="moveCandidateStage(cand.id, $event)">
                        @for (s of stages; track s) {
                          <option [value]="s">{{ s }}</option>
                        }
                      </select>
                    </div>
                  </div>
                }

                @if (getCandidatesForStage(stage).length === 0) {
                  <div class="empty-column">No candidates in {{ stage }}</div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- View 2: Job Openings Grid -->
      @if (activeTab() === 'jobs') {
        <div class="grid-2 jobs-grid">
          @for (job of jobs(); track job.id) {
            <div class="card job-card card-hover">
              <div class="job-header">
                <div>
                  <h3 class="job-title">{{ job.title }}</h3>
                  <div class="job-dept-sub">{{ job.department }} • {{ job.location }}</div>
                </div>
                <app-badge [variant]="job.status === 'Active' ? 'success' : 'neutral'" [label]="job.status"></app-badge>
              </div>

              <p class="job-desc">{{ job.description }}</p>

              <div class="job-tags">
                <span class="tag"><app-icon name="briefcase" [size]="14"></app-icon> {{ job.experienceRange }}</span>
                <span class="tag"><app-icon name="dollar-sign" [size]="14"></app-icon> {{ job.salaryRange }}</span>
                <span class="tag"><app-icon name="users" [size]="14"></app-icon> {{ job.openings }} Positions</span>
              </div>

              <div class="job-footer">
                <span class="text-muted font-xs">{{ job.applicantsCount }} Applicants applied</span>
                <span class="text-muted font-xs">Posted on {{ job.postedDate }}</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal: Post New Job -->
      <app-modal
        [isOpen]="isJobModalOpen()"
        title="Create New Job Posting"
        (close)="isJobModalOpen.set(false)">
        <div class="form-group">
          <label>Job Title *</label>
          <input type="text" class="form-control" [(ngModel)]="newJobTitle" placeholder="e.g. Lead QA Automation Engineer" />
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>Department *</label>
            <select class="form-control" [(ngModel)]="newJobDept">
              @for (dept of departments(); track dept.id) {
                <option [value]="dept.name">{{ dept.name }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label>Work Location</label>
            <input type="text" class="form-control" [(ngModel)]="newJobLocation" placeholder="e.g. Bengaluru / Hybrid" />
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>Experience Range</label>
            <input type="text" class="form-control" [(ngModel)]="newJobExp" placeholder="e.g. 4 - 6 Years" />
          </div>
          <div class="form-group">
            <label>Salary Range</label>
            <input type="text" class="form-control" [(ngModel)]="newJobSalary" placeholder="e.g. ₹16L - ₹22L PA" />
          </div>
        </div>
        <div class="form-group">
          <label>Role Description *</label>
          <textarea class="form-control" rows="3" [(ngModel)]="newJobDesc" placeholder="Responsibilities and qualifications..."></textarea>
        </div>

        <div modal-footer>
          <button type="button" class="btn btn-secondary" (click)="isJobModalOpen.set(false)">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="saveJob()" [disabled]="!newJobTitle.trim()">Create Job</button>
        </div>
      </app-modal>

      <!-- Modal: Add Candidate -->
      <app-modal
        [isOpen]="isCandidateModalOpen()"
        title="Add New Applicant"
        (close)="isCandidateModalOpen.set(false)">
        <div class="form-group">
          <label>Target Job Opening *</label>
          <select class="form-control" [(ngModel)]="newCandJobId">
            @for (job of jobs(); track job.id) {
              <option [value]="job.id">{{ job.title }} ({{ job.department }})</option>
            }
          </select>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>Candidate Name *</label>
            <input type="text" class="form-control" [(ngModel)]="newCandName" placeholder="Full Name" />
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input type="email" class="form-control" [(ngModel)]="newCandEmail" placeholder="candidate@email.com" />
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>Phone</label>
            <input type="text" class="form-control" [(ngModel)]="newCandPhone" placeholder="+91 98765 00000" />
          </div>
          <div class="form-group">
            <label>Experience (Years)</label>
            <input type="number" class="form-control" [(ngModel)]="newCandExp" placeholder="5" />
          </div>
        </div>
        <div class="form-group">
          <label>Recruiter Notes</label>
          <textarea class="form-control" rows="2" [(ngModel)]="newCandNotes" placeholder="Initial screening impressions..."></textarea>
        </div>

        <div modal-footer>
          <button type="button" class="btn btn-secondary" (click)="isCandidateModalOpen.set(false)">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="saveCandidate()" [disabled]="!newCandName.trim()">Add Candidate</button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .recruitment-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Pipeline Kanban */
    .pipeline-board {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
      align-items: flex-start;
      overflow-x: auto;
      padding-bottom: 1rem;

      @media (max-width: 1200px) {
        grid-template-columns: repeat(3, minmax(280px, 1fr));
      }
    }

    .pipeline-column {
      background: var(--bg-surface-subtle);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 0.875rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 480px;

      .column-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-color);

        .column-title {
          font-size: 0.8125rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-main);
        }
      }

      .column-cards {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
    }

    .cand-card {
      padding: 0.875rem;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;

      .cand-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .cand-name { font-size: 0.875rem; font-weight: 700; color: var(--text-main); }
        .cand-job { color: var(--primary-600); font-weight: 600; }
        .cand-rating { font-size: 0.75rem; font-weight: 700; color: var(--warning-600); }
      }

      .cand-meta {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.6875rem;
        color: var(--text-muted);
      }

      .cand-notes {
        font-size: 0.75rem;
        font-style: italic;
        color: var(--text-main);
        background: var(--bg-surface-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
      }

      .stage-select {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
      }
    }

    .empty-column {
      text-align: center;
      padding: 2rem 0.5rem;
      font-size: 0.75rem;
      color: var(--text-subtle);
    }

    /* Jobs grid */
    .job-card {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;

      .job-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .job-title { font-size: 1.125rem; font-weight: 700; color: var(--text-main); }
        .job-dept-sub { font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.125rem; }
      }

      .job-desc {
        font-size: 0.8125rem;
        color: var(--text-muted);
        line-height: 1.4;
      }

      .job-tags {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          background: var(--bg-surface-subtle);
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-full);
          color: var(--text-main);
          font-weight: 500;
        }
      }

      .job-footer {
        display: flex;
        justify-content: space-between;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-color);
      }
    }

    .font-xs { font-size: 0.75rem; }
  `]
})
export class RecruitmentComponent {
  private readonly hrmsData = inject(HrmsDataService);
  private readonly toast = inject(NotificationService);

  readonly jobs = this.hrmsData.jobPostings;
  readonly candidates = this.hrmsData.candidates;
  readonly departments = this.hrmsData.departments;

  readonly activeTab = signal<'pipeline' | 'jobs'>('pipeline');
  readonly isJobModalOpen = signal<boolean>(false);
  readonly isCandidateModalOpen = signal<boolean>(false);

  readonly stages: CandidateStage[] = ['Applied', 'Screening', 'Interview', 'Offered', 'Hired'];

  // Form states for Job
  newJobTitle = '';
  newJobDept = 'Engineering';
  newJobLocation = 'Bengaluru / Hybrid';
  newJobExp = '3 - 6 Years';
  newJobSalary = '₹16L - ₹24L PA';
  newJobDesc = '';

  // Form states for Candidate
  newCandJobId = 'JOB-101';
  newCandName = '';
  newCandEmail = '';
  newCandPhone = '+91 ';
  newCandExp = 4;
  newCandNotes = '';

  readonly activeJobsCount = computed(() => this.jobs().filter(j => j.status === 'Active').length);
  readonly interviewCount = computed(() => this.candidates().filter(c => c.stage === 'Interview').length);
  readonly offeredCount = computed(() => this.candidates().filter(c => c.stage === 'Offered').length);

  getCandidatesForStage(stage: CandidateStage): Candidate[] {
    return this.candidates().filter(c => c.stage === stage);
  }

  moveCandidateStage(candId: string, newStage: CandidateStage): void {
    this.hrmsData.updateCandidateStage(candId, newStage);
    this.toast.info('Stage Updated', `Candidate stage moved to ${newStage}.`);
  }

  saveJob(): void {
    this.hrmsData.addJobPosting({
      title: this.newJobTitle,
      department: this.newJobDept,
      location: this.newJobLocation,
      type: 'Full-Time',
      openings: 2,
      experienceRange: this.newJobExp,
      salaryRange: this.newJobSalary,
      status: 'Active',
      description: this.newJobDesc
    });

    this.toast.success('Job Published', `New opening for ${this.newJobTitle} is now live.`);
    this.isJobModalOpen.set(false);
    this.newJobTitle = '';
    this.newJobDesc = '';
  }

  saveCandidate(): void {
    const job = this.jobs().find(j => j.id === this.newCandJobId);
    this.hrmsData.addCandidate({
      jobId: this.newCandJobId,
      jobTitle: job?.title || 'Open Position',
      name: this.newCandName,
      email: this.newCandEmail,
      phone: this.newCandPhone,
      experienceYears: this.newCandExp,
      stage: 'Applied',
      rating: 4,
      notes: this.newCandNotes
    });

    this.toast.success('Applicant Added', `${this.newCandName} was added to the applicant pool.`);
    this.isCandidateModalOpen.set(false);
    this.newCandName = '';
    this.newCandEmail = '';
    this.newCandNotes = '';
  }
}
