import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { FeatureApiService, UserFeature } from '../../core/services/feature-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-manage-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, IconComponent],
  template: `
    <div class="page-header">
      <div class="header-left">
        <div class="header-breadcrumb">
          <span>Administration</span>
          <app-icon name="chevron-right" [size]="14"></app-icon>
          <span class="active">Manage Menus</span>
        </div>
        <h1 class="page-title">Menu Management</h1>
        <p class="page-subtitle">Configure dynamic sidebar menus, child routes, and endpoint permissions.</p>
      </div>

      <div class="header-actions">
        <button type="button" class="btn btn-secondary" (click)="syncWithBackend()" [disabled]="featureApi.isLoading()">
          <app-icon name="trending-up" [size]="16"></app-icon>
          <span>{{ featureApi.isLoading() ? 'Syncing...' : 'Sync Backend API' }}</span>
        </button>
        <button type="button" class="btn btn-primary" (click)="openAddModal()">
          <app-icon name="plus" [size]="16"></app-icon>
          <span>Add Menu</span>
        </button>
      </div>
    </div>

    <!-- API Connection Status Banner -->
    <div class="status-banner" [class.synced]="featureApi.lastSyncStatus() === 'synced'">
      <div class="status-icon">
        <app-icon [name]="featureApi.lastSyncStatus() === 'synced' ? 'check-circle' : 'database'" [size]="20"></app-icon>
      </div>
      <div class="status-details">
        <div class="status-title">
          {{ featureApi.lastSyncStatus() === 'synced' ? 'Connected to Backend API' : 'Dynamic Menu Engine Active' }}
        </div>
      </div>
      <div class="status-tag">
        {{ featureApi.lastSyncStatus() === 'synced' ? 'Live Data' : 'Reactive State' }}
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-indigo">
          <app-icon name="grid" [size]="22"></app-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Menus</span>
          <span class="stat-value">{{ totalMenusCount() }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-emerald">
          <app-icon name="check-circle" [size]="22"></app-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">Active Menus</span>
          <span class="stat-value">{{ activeMenusCount() }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-purple">
          <app-icon name="layers" [size]="22"></app-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">Parent Groups</span>
          <span class="stat-value">{{ parentGroupsCount() }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-amber">
          <app-icon name="shield" [size]="22"></app-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">Submenu Items</span>
          <span class="stat-value">{{ childMenusCount() }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-card">
      <div class="table-toolbar">
        <div class="search-box">
          <app-icon name="search" [size]="16"></app-icon>
          <input 
            type="text" 
            placeholder="Search menu title, path, or code..." 
            [(ngModel)]="searchQuery" 
            class="form-control">
        </div>

        <div class="filter-actions">
          <select [(ngModel)]="selectedCategory" class="form-control category-select">
            <option value="ALL">All Categories</option>
            @for (cat of categories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Menu Items Table -->
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 50px;">Icon</th>
              <th>Menu Title / Label</th>
              <th>Route Path</th>
              <th>Category</th>
              <th>Hierarchy</th>
              <th>Order</th>
              <th>Status</th>
              <th style="width: 140px; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (item of filteredFeatures(); track item.id || item.code) {
              <!-- Parent Row -->
              <tr [class.is-parent]="item.children && item.children.length > 0">
                <td>
                  <div class="menu-icon-box">
                    <app-icon [name]="item.icon || 'grid'" [size]="18"></app-icon>
                  </div>
                </td>
                <td>
                  <div class="menu-title-cell">
                    <strong>{{ item.title }}</strong>
                    <span class="menu-code"><code>{{ item.code }}</code></span>
                  </div>
                </td>
                <td>
                  <span class="path-badge"><code>{{ item.path }}</code></span>
                </td>
                <td>
                  <span class="category-pill">{{ item.category || 'CORE WORKSPACE' }}</span>
                </td>
                <td>
                  @if (item.children && item.children.length > 0) {
                    <span class="hierarchy-badge parent">
                      Parent ({{ item.children.length }} submenus)
                    </span>
                  } @else {
                    <span class="hierarchy-badge root">Top-Level</span>
                  }
                </td>
                <td>
                  <span class="order-number">{{ item.orderIndex }}</span>
                </td>
                <td>
                  <button 
                    type="button" 
                    class="status-toggle" 
                    [class.active]="item.enabled"
                    (click)="toggleStatus(item.id)">
                    <span class="toggle-switch"></span>
                    <span class="toggle-text">{{ item.enabled ? 'Enabled' : 'Disabled' }}</span>
                  </button>
                </td>
                <td style="text-align: right;">
                  <div class="row-actions">
                    <button type="button" class="btn-action" title="Add Child Menu" (click)="openAddChildModal(item)">
                      <app-icon name="plus" [size]="14"></app-icon>
                    </button>
                    <button type="button" class="btn-action danger" title="Delete Menu" (click)="deleteMenu(item.id)">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Nested Child Rows -->
              @if (item.children && item.children.length > 0) {
                @for (child of item.children; track child.id || child.code) {
                  <tr class="child-row">
                    <td>
                      <div class="menu-icon-box child">
                        <app-icon [name]="child.icon || 'chevron-right'" [size]="14"></app-icon>
                      </div>
                    </td>
                    <td>
                      <div class="child-indent">
                        <span class="indent-guide">↳</span>
                        <div class="menu-title-cell">
                          <span class="child-title">{{ child.title }}</span>
                          <span class="menu-code"><code>{{ child.code }}</code></span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="path-badge child"><code>{{ child.path }}</code></span>
                    </td>
                    <td>
                      <span class="category-pill">{{ child.category || item.category }}</span>
                    </td>
                    <td>
                      <span class="hierarchy-badge child">Submenu of {{ item.title }}</span>
                    </td>
                    <td>
                      <span class="order-number">{{ child.orderIndex }}</span>
                    </td>
                    <td>
                      <button 
                        type="button" 
                        class="status-toggle" 
                        [class.active]="child.enabled"
                        (click)="toggleStatus(child.id)">
                        <span class="toggle-switch"></span>
                        <span class="toggle-text">{{ child.enabled ? 'Enabled' : 'Disabled' }}</span>
                      </button>
                    </td>
                    <td style="text-align: right;">
                      <div class="row-actions">
                        <button type="button" class="btn-action danger" title="Delete Child Menu" (click)="deleteMenu(child.id)">
                          <app-icon name="trash" [size]="14"></app-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Menu Modal -->
    @if (isModalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-wrapper">
              <div class="modal-icon bg-indigo">
                <app-icon name="plus-circle" [size]="20"></app-icon>
              </div>
              <div>
                <h3 class="modal-title">{{ isChildModal() ? 'Add Child Submenu' : 'Add New Menu Item' }}</h3>
                <p class="modal-subtitle">Configure route path, display title, icon, and hierarchy.</p>
              </div>
            </div>
            <button type="button" class="btn-close" (click)="closeModal()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form [formGroup]="menuForm" (ngSubmit)="saveMenu()" class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label required">Menu Title</label>
                <input type="text" formControlName="title" class="form-control" placeholder="e.g. Asset Management">
              </div>

              <div class="form-group">
                <label class="form-label required">Route Path</label>
                <input type="text" formControlName="path" class="form-control" placeholder="e.g. /assets">
              </div>

              <div class="form-group">
                <label class="form-label">Parent Menu</label>
                <select formControlName="parentId" class="form-control">
                  <option [value]="''">None (Top-Level Menu)</option>
                  @for (parent of parentOptions(); track parent.id) {
                    <option [value]="parent.id">{{ parent.title }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" formControlName="category" class="form-control" placeholder="e.g. CORE WORKSPACE">
              </div>

              <div class="form-group">
                <label class="form-label">Order Index</label>
                <input type="number" formControlName="orderIndex" class="form-control" placeholder="e.g. 50">
              </div>

              <div class="form-group">
                <label class="form-label">Badge Count (Optional)</label>
                <input type="number" formControlName="badge" class="form-control" placeholder="e.g. 3">
              </div>
            </div>

            <!-- Icon Picker -->
            <div class="form-group">
              <label class="form-label">Choose Icon</label>
              <div class="icon-selector-grid">
                @for (icon of availableIcons; track icon) {
                  <button 
                    type="button" 
                    class="icon-picker-btn" 
                    [class.selected]="menuForm.get('icon')?.value === icon"
                    (click)="selectIcon(icon)"
                    [title]="icon">
                    <app-icon [name]="icon" [size]="18"></app-icon>
                  </button>
                }
              </div>
            </div>

            <!-- Live Preview of Sidebar Link -->
            <div class="preview-box">
              <span class="preview-label">Live Sidebar Preview:</span>
              <div class="preview-nav-item">
                <span class="preview-icon">
                  <app-icon [name]="menuForm.get('icon')?.value || 'grid'" [size]="18"></app-icon>
                </span>
                <span class="preview-text">{{ menuForm.get('title')?.value || 'New Menu Title' }}</span>
                @if ((menuForm.get('badge')?.value ?? 0) > 0) {
                  <span class="preview-badge">{{ menuForm.get('badge')?.value }}</span>
                }
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="menuForm.invalid">
                <app-icon name="check" [size]="16"></app-icon>
                <span>Save Menu Item</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      padding: 1.5rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #94a3b8;
      margin-bottom: 0.35rem;

      .active {
        color: var(--primary-400);
        font-weight: 600;
      }
    }

    .page-title {
      font-size: 1.625rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
      margin: 0 0 0.25rem 0;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: #94a3b8;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1.25rem;
      border-radius: var(--radius-lg);
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.25);
      margin-bottom: 1.5rem;

      &.synced {
        background: rgba(16, 185, 129, 0.08);
        border-color: rgba(16, 185, 129, 0.3);

        .status-icon {
          color: #34d399;
          background: rgba(16, 185, 129, 0.15);
        }

        .status-tag {
          background: rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
        }
      }

      .status-icon {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(99, 102, 241, 0.2);
        color: var(--primary-400);
      }

      .status-details {
        flex: 1;

        .status-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.125rem;
        }

        .status-sub {
          font-size: 0.8125rem;
          color: #94a3b8;

          code {
            color: var(--primary-300);
            background: rgba(0, 0, 0, 0.3);
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
          }
        }
      }

      .status-tag {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        padding: 0.25rem 0.625rem;
        border-radius: var(--radius-full);
        background: rgba(99, 102, 241, 0.2);
        color: var(--primary-300);
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.125rem 1.25rem;
      border-radius: var(--radius-lg);
      background: var(--surface-card, #1e293b);
      border: 1px solid var(--sidebar-border, #334155);

      .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;

        &.bg-indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); }
        &.bg-emerald { background: linear-gradient(135deg, #10b981, #059669); }
        &.bg-purple { background: linear-gradient(135deg, #a855f7, #7c3aed); }
        &.bg-amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
      }

      .stat-info {
        display: flex;
        flex-direction: column;

        .stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .stat-value {
          font-size: 1.375rem;
          font-weight: 800;
          color: #ffffff;
        }
      }
    }

    .content-card {
      background: var(--surface-card, #1e293b);
      border: 1px solid var(--sidebar-border, #334155);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      gap: 1rem;
      flex-wrap: wrap;

      .search-box {
        position: relative;
        flex: 1;
        max-width: 380px;

        app-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        input {
          padding-left: 2.375rem;
        }
      }

      .category-select {
        min-width: 180px;
      }
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 0.875rem 1rem;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        font-size: 0.875rem;
      }

      th {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #94a3b8;
        letter-spacing: 0.05em;
        background: rgba(0, 0, 0, 0.15);
      }

      tbody tr:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      tr.child-row {
        background: rgba(0, 0, 0, 0.1);
      }
    }

    .menu-icon-box {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(99, 102, 241, 0.15);
      color: var(--primary-400);

      &.child {
        width: 26px;
        height: 26px;
        background: rgba(255, 255, 255, 0.05);
        color: #94a3b8;
        margin-left: 0.5rem;
      }
    }

    .menu-title-cell {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;

      strong {
        color: #f1f5f9;
      }

      .menu-code code {
        font-size: 0.6875rem;
        color: #64748b;
      }
    }

    .child-indent {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-left: 0.75rem;

      .indent-guide {
        color: var(--primary-400);
        font-weight: bold;
      }

      .child-title {
        color: #e2e8f0;
        font-weight: 600;
      }
    }

    .path-badge {
      code {
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.1);
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8125rem;
      }

      &.child code {
        color: #94a3b8;
        background: rgba(255, 255, 255, 0.05);
      }
    }

    .category-pill {
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
    }

    .hierarchy-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);

      &.root {
        background: rgba(99, 102, 241, 0.15);
        color: var(--primary-300);
      }

      &.parent {
        background: rgba(168, 85, 247, 0.15);
        color: #c084fc;
      }

      &.child {
        background: rgba(16, 185, 129, 0.15);
        color: #6ee7b7;
      }
    }

    .order-number {
      font-weight: 700;
      color: #cbd5e1;
    }

    .status-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.25rem;

      .toggle-switch {
        width: 32px;
        height: 18px;
        background: #475569;
        border-radius: 18px;
        position: relative;
        transition: background 0.2s;

        &::after {
          content: '';
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          top: 2px;
          left: 2px;
          transition: transform 0.2s;
        }
      }

      .toggle-text {
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;
      }

      &.active {
        .toggle-switch {
          background: #10b981;
          &::after {
            transform: translateX(14px);
          }
        }
        .toggle-text {
          color: #34d399;
        }
      }
    }

    .row-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.35rem;

      .btn-action {
        width: 28px;
        height: 28px;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border: none;
        color: #94a3b8;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: var(--primary-600);
          color: #ffffff;
        }

        &.danger:hover {
          background: #ef4444;
          color: #ffffff;
        }
      }
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-dialog {
      background: var(--surface-card, #1e293b);
      border: 1px solid var(--sidebar-border, #334155);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 600px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      animation: modalZoom 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalZoom {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      .modal-title-wrapper {
        display: flex;
        align-items: center;
        gap: 0.875rem;

        .modal-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          &.bg-indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); }
        }
      }

      .modal-title {
        font-size: 1.125rem;
        font-weight: 800;
        color: #ffffff;
        margin: 0;
      }

      .modal-subtitle {
        font-size: 0.8125rem;
        color: #94a3b8;
        margin: 0;
      }

      .btn-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        &:hover { color: #ffffff; background: rgba(255, 255, 255, 0.1); }
      }
    }

    .modal-body {
      padding: 1.5rem;

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        .form-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #cbd5e1;

          &.required::after {
            content: ' *';
            color: #f43f5e;
          }
        }
      }

      .form-control {
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: var(--radius-md);
        padding: 0.55rem 0.875rem;
        color: #ffffff;
        font-size: 0.875rem;
        outline: none;
        transition: border-color 0.2s;

        &:focus {
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }
      }

      .icon-selector-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
        gap: 0.5rem;
        max-height: 120px;
        overflow-y: auto;
        background: rgba(0, 0, 0, 0.2);
        padding: 0.5rem;
        border-radius: var(--radius-md);
        border: 1px solid rgba(255, 255, 255, 0.08);

        .icon-picker-btn {
          height: 36px;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid transparent;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
          }

          &.selected {
            background: var(--primary-600);
            border-color: var(--primary-400);
            color: #ffffff;
          }
        }
      }

      .preview-box {
        margin-top: 1.25rem;
        padding: 0.875rem 1rem;
        border-radius: var(--radius-md);
        background: rgba(0, 0, 0, 0.35);
        border: 1px dashed rgba(255, 255, 255, 0.15);

        .preview-label {
          font-size: 0.6875rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          display: block;
        }

        .preview-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.875rem;
          border-radius: var(--radius-md);
          background: rgba(99, 102, 241, 0.15);
          color: var(--primary-300);
          max-width: 240px;

          .preview-icon {
            display: flex;
            align-items: center;
          }

          .preview-text {
            flex: 1;
            font-weight: 600;
            font-size: 0.875rem;
          }

          .preview-badge {
            font-size: 0.6875rem;
            font-weight: 700;
            background: var(--primary-500);
            color: #ffffff;
            padding: 0.125rem 0.45rem;
            border-radius: var(--radius-full);
          }
        }
      }
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;

      &.btn-primary {
        background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
          transform: translateY(-1px);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      &.btn-secondary {
        background: rgba(255, 255, 255, 0.07);
        color: #e2e8f0;
        border: 1px solid rgba(255, 255, 255, 0.12);

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }
      }
    }
  `]
})
export class ManageMenuComponent {
  readonly featureApi = inject(FeatureApiService);
  readonly authService = inject(AuthService);
  private readonly toast = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  searchQuery = '';
  selectedCategory = 'ALL';
  isModalOpen = signal<boolean>(false);
  isChildModal = signal<boolean>(false);

  readonly availableIcons = [
    'dashboard', 'users', 'user-plus', 'clock', 'calendar', 'dollar-sign',
    'briefcase', 'award', 'settings', 'grid', 'list', 'file-text', 'layers',
    'shield', 'folder', 'sliders', 'database', 'lock', 'plus-circle', 'building'
  ];

  menuForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    path: ['', [Validators.required]],
    icon: ['grid', [Validators.required]],
    category: ['CORE WORKSPACE'],
    orderIndex: [50, [Validators.required]],
    badge: [null],
    parentId: ['']
  });

  constructor() {
    this.route.url.subscribe(segments => {
      if (segments.some(s => s.path === 'add')) {
        this.openAddModal();
      }
    });
  }

  readonly categories = computed<string[]>(() => {
    const cats = new Set<string>();
    for (const f of this.featureApi.activeFeatures()) {
      if (f.category) cats.add(f.category);
    }
    return Array.from(cats);
  });

  readonly parentOptions = computed<UserFeature[]>(() => {
    return this.featureApi.activeFeatures().filter(f => !f.children || f.children.length >= 0);
  });

  readonly totalMenusCount = computed(() => {
    let count = 0;
    for (const f of this.featureApi.activeFeatures()) {
      count++;
      if (f.children) count += f.children.length;
    }
    return count;
  });

  readonly activeMenusCount = computed(() => {
    let count = 0;
    for (const f of this.featureApi.activeFeatures()) {
      if (f.enabled) count++;
      if (f.children) count += f.children.filter(c => c.enabled).length;
    }
    return count;
  });

  readonly parentGroupsCount = computed(() => {
    return this.featureApi.activeFeatures().filter(f => f.children && f.children.length > 0).length;
  });

  readonly childMenusCount = computed(() => {
    let count = 0;
    for (const f of this.featureApi.activeFeatures()) {
      if (f.children) count += f.children.length;
    }
    return count;
  });

  readonly filteredFeatures = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    const cat = this.selectedCategory;

    return this.featureApi.activeFeatures().filter(item => {
      const matchCat = cat === 'ALL' || item.category === cat;
      if (!matchCat) return false;

      if (!query) return true;

      const titleMatch = item.title?.toLowerCase().includes(query);
      const pathMatch = item.path?.toLowerCase().includes(query);
      const codeMatch = item.code?.toLowerCase().includes(query);
      const childMatch = item.children?.some(c =>
        c.title.toLowerCase().includes(query) || c.path.toLowerCase().includes(query)
      );

      return titleMatch || pathMatch || codeMatch || childMatch;
    });
  });

  syncWithBackend(): void {
    this.featureApi.getCurrentUserFeatures().subscribe({
      next: features => {
        this.toast.success(
          'Dynamic Menus Refreshed',
          `Synced with http://localhost:8080/api/v1/users/me/features (${features.length} top menus loaded).`
        );
      },
      error: () => {
        this.toast.error('Sync Error', 'Unable to reach backend endpoint at http://localhost:8080/api/v1/users/me/features.');
      }
    });
  }

  openAddModal(): void {
    this.isChildModal.set(false);
    this.menuForm.reset({
      title: '',
      path: '',
      icon: 'grid',
      category: 'CORE WORKSPACE',
      orderIndex: (this.totalMenusCount() + 1) * 10,
      badge: null,
      parentId: ''
    });
    this.isModalOpen.set(true);
  }

  openAddChildModal(parent: UserFeature): void {
    this.isChildModal.set(true);
    this.menuForm.reset({
      title: '',
      path: parent.path ? `${parent.path}/` : '',
      icon: 'chevron-right',
      category: parent.category || 'CORE WORKSPACE',
      orderIndex: (parent.children?.length || 0) + 1,
      badge: null,
      parentId: parent.id
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  selectIcon(icon: string): void {
    this.menuForm.patchValue({ icon });
  }

  toggleStatus(id: string): void {
    this.featureApi.toggleFeatureStatus(id);
    this.toast.info('Menu Updated', 'Menu status toggle updated in sidebar navigation.');
  }

  deleteMenu(id: string): void {
    if (confirm('Are you sure you want to delete this menu item from dynamic sidebar?')) {
      this.featureApi.deleteFeature(id);
      this.toast.success('Menu Removed', 'Menu item removed from navigation.');
    }
  }

  saveMenu(): void {
    if (this.menuForm.invalid) return;

    const val = this.menuForm.value;
    const parentId = val.parentId || undefined;

    this.featureApi.addCustomFeature({
      title: val.title!,
      path: val.path!,
      icon: val.icon!,
      category: val.category || 'CUSTOM',
      orderIndex: Number(val.orderIndex || 50),
      badge: val.badge ? Number(val.badge) : undefined,
      enabled: true
    }, parentId);

    this.toast.success('Menu Created', `"${val.title}" added to dynamic sidebar successfully.`);
    this.closeModal();
  }
}
