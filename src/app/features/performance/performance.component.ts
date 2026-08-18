import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HrmsDataService } from '../../core/services/hrms-data.service';
import { Goal, GoalPriority, GoalStatus } from '../../core/models/performance.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent, StatCardComponent, ModalComponent],
  template: `
    <div class="performance-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-titles">
          <h1>Performance & OKRs Management</h1>
          <p>Track quarterly goals, team key results, performance ratings, and reviews.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-primary" (click)="isGoalModalOpen.set(true)">
            <app-icon name="plus" [size]="18"></app-icon>
            <span>Set New OKR / Goal</span>
          </button>
        </div>
      </div>

      <!-- KPI Stats -->
      <div class="grid-4">
        <app-stat-card
          title="Active Key Results"
          [value]="goals().length"
          icon="award"
          accentColor="var(--primary-500)"
          iconBg="var(--primary-50)"
        ></app-stat-card>

        <app-stat-card
          title="Avg Goal Progress"
          [value]="avgProgress() + '%'"
          icon="trending-up"
          accentColor="var(--success-500)"
          iconBg="var(--success-50)"
          trend="Q3 Target: 80%"
          trendType="up"
        ></app-stat-card>

        <app-stat-card
          title="Completed Goals"
          [value]="completedCount()"
          icon="check-circle"
          accentColor="var(--accent-purple)"
          iconBg="rgba(139, 92, 246, 0.1)"
          subtitle="Closed successfully"
        ></app-stat-card>

        <app-stat-card
          title="High Priority OKRs"
          [value]="highPriorityCount()"
          icon="alert-circle"
          accentColor="var(--warning-500)"
          iconBg="var(--warning-50)"
          subtitle="Critical deliverables"
        ></app-stat-card>
      </div>

      <!-- Goals List -->
      <div class="card">
        <div class="flex-between mb-4">
          <div>
            <h3 class="section-title">Team OKRs & Objective Progress</h3>
            <span class="text-muted font-xs">Update slider to record incremental progress milestones</span>
          </div>

          <div class="category-filters">
            <button 
              type="button" 
              class="filter-pill" 
              [class.active]="selectedCategory() === 'ALL'" 
              (click)="selectedCategory.set('ALL')">
              All Categories
            </button>
            <button 
              type="button" 
              class="filter-pill" 
              [class.active]="selectedCategory() === 'Strategic'" 
              (click)="selectedCategory.set('Strategic')">
              Strategic
            </button>
            <button 
              type="button" 
              class="filter-pill" 
              [class.active]="selectedCategory() === 'Operational'" 
              (click)="selectedCategory.set('Operational')">
              Operational
            </button>
            <button 
              type="button" 
              class="filter-pill" 
              [class.active]="selectedCategory() === 'Learning'" 
              (click)="selectedCategory.set('Learning')">
              Learning
            </button>
          </div>
        </div>

        <div class="goals-list">
          @for (goal of filteredGoals(); track goal.id) {
            <div class="goal-item card">
              <div class="goal-top">
                <div class="goal-main-info">
                  <div class="flex-align gap-2">
                    <span class="badge" [ngClass]="getCategoryBadgeClass(goal.category)">{{ goal.category }}</span>
                    <app-badge [variant]="getPriorityVariant(goal.priority)" [label]="goal.priority + ' Priority'"></app-badge>
                    <app-badge [variant]="getStatusVariant(goal.status)" [label]="goal.status"></app-badge>
                  </div>
                  <h3 class="goal-title">{{ goal.title }}</h3>
                  <p class="goal-desc">{{ goal.description }}</p>
                </div>

                <div class="goal-owner">
                  <div class="avatar avatar-sm">{{ goal.employeeName[0] }}</div>
                  <div>
                    <div class="font-bold font-xs">{{ goal.employeeName }}</div>
                    <div class="text-muted font-xs">Due {{ goal.dueDate }}</div>
                  </div>
                </div>
              </div>

              <!-- Progress Bar & Slider Control -->
              <div class="goal-progress-section">
                <div class="progress-info">
                  <span class="progress-label">Key Result Progress</span>
                  <span class="progress-val font-mono font-bold">{{ goal.progressPercent }}%</span>
                </div>
                <div class="progress-track">
                  <div 
                    class="progress-fill" 
                    [style.width.%]="goal.progressPercent"
                    [ngClass]="goal.progressPercent === 100 ? 'bg-success' : 'bg-primary'"></div>
                </div>
                <div class="progress-slider-box">
                  <span class="font-xs text-muted">Update Progress:</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5" 
                    [value]="goal.progressPercent" 
                    (input)="onProgressChange(goal.id, $event)"
                    class="progress-range"
                  />
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Modal: Set New Goal -->
      <app-modal
        [isOpen]="isGoalModalOpen()"
        title="Define Objective & Key Result (OKR)"
        (close)="isGoalModalOpen.set(false)">
        <div class="form-group">
          <label>Assignee Employee *</label>
          <select class="form-control" [(ngModel)]="newGoalEmpId">
            @for (emp of employees(); track emp.id) {
              <option [value]="emp.id">{{ emp.firstName }} {{ emp.lastName }} ({{ emp.department }})</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label>Objective Title *</label>
          <input type="text" class="form-control" [(ngModel)]="newGoalTitle" placeholder="e.g. Implement Microfrontend state bus" />
        </div>

        <div class="grid-3">
          <div class="form-group">
            <label>Category</label>
            <select class="form-control" [(ngModel)]="newGoalCategory">
              <option value="Strategic">Strategic</option>
              <option value="Operational">Operational</option>
              <option value="Learning">Learning</option>
              <option value="Leadership">Leadership</option>
            </select>
          </div>
          <div class="form-group">
            <label>Priority</label>
            <select class="form-control" [(ngModel)]="newGoalPriority">
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div class="form-group">
            <label>Target Due Date *</label>
            <input type="date" class="form-control" [(ngModel)]="newGoalDue" />
          </div>
        </div>

        <div class="form-group">
          <label>Description & Success Criteria</label>
          <textarea class="form-control" rows="3" [(ngModel)]="newGoalDesc" placeholder="Measurable milestones..."></textarea>
        </div>

        <div modal-footer>
          <button type="button" class="btn btn-secondary" (click)="isGoalModalOpen.set(false)">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="saveGoal()" [disabled]="!newGoalTitle.trim()">Create OKR</button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    .performance-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .category-filters {
      display: flex;
      gap: 0.5rem;

      .filter-pill {
        padding: 0.375rem 0.75rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 600;
        background: var(--bg-surface-subtle);
        color: var(--text-muted);
        border: 1px solid var(--border-color);

        &.active {
          background: var(--primary-500);
          color: #ffffff;
        }
      }
    }

    .goals-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .goal-item {
      background: var(--bg-surface-subtle);
      border: 1px solid var(--border-color);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .goal-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1.5rem;

        .goal-main-info {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;

          .goal-title { font-size: 1.0625rem; font-weight: 700; color: var(--text-main); }
          .goal-desc { font-size: 0.8125rem; color: var(--text-muted); line-height: 1.4; }
        }

        .goal-owner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-surface);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }
      }

      .goal-progress-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-color);

        .progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .progress-track {
          height: 8px;
          background: var(--border-color);
          border-radius: var(--radius-full);
          overflow: hidden;

          .progress-fill {
            height: 100%;
            border-radius: var(--radius-full);
            transition: width 0.3s ease;

            &.bg-primary { background: linear-gradient(90deg, var(--primary-600), var(--primary-400)); }
            &.bg-success { background: linear-gradient(90deg, var(--success-600), var(--success-400)); }
          }
        }

        .progress-slider-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.25rem;

          .progress-range {
            flex: 1;
            accent-color: var(--primary-600);
          }
        }
      }
    }

    .section-title { font-size: 1.0625rem; font-weight: 700; color: var(--text-main); }
    .font-mono { font-family: var(--font-mono); }
    .font-bold { font-weight: 700; }
    .font-xs { font-size: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
  `]
})
export class PerformanceComponent {
  private readonly hrmsData = inject(HrmsDataService);
  private readonly toast = inject(NotificationService);

  readonly goals = this.hrmsData.goals;
  readonly employees = this.hrmsData.employees;

  readonly selectedCategory = signal<string>('ALL');
  readonly isGoalModalOpen = signal<boolean>(false);

  // Form states
  newGoalEmpId = 'EMP-1001';
  newGoalTitle = '';
  newGoalCategory: any = 'Strategic';
  newGoalPriority: GoalPriority = 'High';
  newGoalDue = '2026-09-30';
  newGoalDesc = '';

  readonly avgProgress = computed(() => {
    const list = this.goals();
    if (!list.length) return 0;
    const total = list.reduce((sum, g) => sum + g.progressPercent, 0);
    return Math.round(total / list.length);
  });

  readonly completedCount = computed(() => this.goals().filter(g => g.status === 'Completed').length);
  readonly highPriorityCount = computed(() => this.goals().filter(g => g.priority === 'High').length);

  readonly filteredGoals = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'ALL') return this.goals();
    return this.goals().filter(g => g.category === cat);
  });

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'Strategic': return 'badge-primary';
      case 'Operational': return 'badge-warning';
      case 'Learning': return 'badge-success';
      default: return 'badge-neutral';
    }
  }

  getPriorityVariant(priority: GoalPriority): any {
    switch (priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      default: return 'neutral';
    }
  }

  getStatusVariant(status: GoalStatus): any {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      default: return 'neutral';
    }
  }

  onProgressChange(goalId: string, event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.hrmsData.updateGoalProgress(goalId, val);
  }

  saveGoal(): void {
    const emp = this.employees().find(e => e.id === this.newGoalEmpId);
    this.hrmsData.addGoal({
      employeeId: this.newGoalEmpId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Jitendra Shukla',
      title: this.newGoalTitle,
      description: this.newGoalDesc,
      category: this.newGoalCategory,
      priority: this.newGoalPriority,
      status: 'In Progress',
      progressPercent: 10,
      dueDate: this.newGoalDue,
      assignedBy: 'Executive Team'
    });

    this.toast.success('Goal Configured', `New OKR '${this.newGoalTitle}' created.`);
    this.isGoalModalOpen.set(false);
    this.newGoalTitle = '';
    this.newGoalDesc = '';
  }
}
