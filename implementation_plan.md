# Implementation Plan - Angular 19 HRMS (Human Resource Management System)

Create a state-of-the-art, modern enterprise HRMS application built with **Angular 19** featuring standalone components, modern control flow (`@if`, `@for`), Angular Signals for reactive state management, and a sleek, premium UI design.

## User Review Required

> [!IMPORTANT]
> The project will be initialized directly in the current workspace (`d:\JITENDRA_SHUKLA\HRMS`) using Angular 19 standalone architecture, SCSS styling, and Signal-driven local storage reactive state.
> 
> Key features included out-of-the-box:
> - **Dashboard**: Real-time KPI cards, headcount distribution, attendance overview, holiday & announcements feed.
> - **Employee Directory**: Grid & Table views, advanced filtering/search, multi-step Add/Edit employee modal, detailed profile view.
> - **Attendance & Time Tracking**: Live Clock In / Clock Out timer with state persistence, daily logs, timesheet breakdown.
> - **Leave Management**: Leave balance cards, interactive leave application with approval/rejection manager workflow.
> - **Payroll & Compensation**: Monthly salary processing, salary structure breakdown, printable/downloadable payslip generator.
> - **Recruitment / ATS**: Job postings board and visual candidate hiring pipeline (Applied, Screening, Interview, Offered, Hired).
> - **Performance & OKRs**: Employee appraisal tracking, goals, and feedback ratings.
> - **Organization & Settings**: Company details, Department & Designation manager, Dark/Light mode theme switch.

## Proposed Architecture & Tech Stack

- **Framework**: Angular 19 (Standalone Components, Signals, new Control Flow `@if`/`@for`/`@switch`, Reactive Forms, Typed Router)
- **Styling**: SCSS with a custom CSS Custom Property (Variables) Design System, Glassmorphism elements, Dark/Light Mode, responsive sidebar/layout.
- **Icons**: Scalable custom SVG Icon Component system for zero external font-loading dependencies and crisp rendering.
- **State Management**: Reactive Signal-based Services with LocalStorage syncing and comprehensive initial mock data.

---

## Proposed Implementation Steps

### Phase 1: Project Initialization
- Initialize Angular 19 application in `d:\JITENDRA_SHUKLA\HRMS` with SCSS, routing enabled, and SSR disabled for optimized client-side responsiveness.
- Configure `angular.json`, `tsconfig.json`, and root dependencies.

### Phase 2: Design System & Core Utilities
- Configure `src/styles.scss` with CSS variables for color tokens (primary indigo/violet, emerald success, amber warning, rose danger, surface layers, glass effects, dark mode variables).
- Implement standard typography (`Inter`, `Plus Jakarta Sans`), elevation shadows, badge styles, button styles, modal styles, and form control styles.
- Create shared SVG icon registry and reusable UI components (`IconComponent`, `BadgeComponent`, `StatCardComponent`, `ModalComponent`, `TabsComponent`, `PaginationComponent`).

### Phase 3: Core State & Mock Data Services
- Define TypeScript models for: `Employee`, `Department`, `Designation`, `AttendanceRecord`, `LeaveRequest`, `Payslip`, `JobPosting`, `Candidate`, `Goal`, `Announcement`.
- Create `HrmsDataService` using Angular Signals (`signal`, `computed`, `effect`) with seed data for 15+ realistic employees, attendance histories, leaves, payroll records, and job candidates.
- Create `ThemeService` for seamless Light / Dark theme toggling.
- Create `NotificationService` for toast alerts (e.g. employee added, leave approved, clocked in).

### Phase 4: Layout & Navigation Shell
- `HeaderComponent`: Live punch widget, search bar, notification drawer with unread counter, theme switcher, user profile dropdown.
- `SidebarComponent`: Collapsible responsive sidebar with navigation links, badges for pending leaves/applications, and quick stats.
- `MainLayoutComponent`: Responsive wrapper with header, sidebar, breadcrumb trail, and routed outlet.

### Phase 5: Feature Modules & Pages
1. **Dashboard (`/dashboard`)**:
   - Total Employees, Present Today, On Leave, Open Positions, Payroll Budget.
   - Attendance chart & Department headcount distribution visualizer.
   - Quick Punch In / Out widget with real-time timer.
   - Recent Activities, Upcoming Holidays, and Birthday reminders.
2. **Employees (`/employees`, `/employees/:id`)**:
   - Directory with Search, Department filter, Status filter (Active, On Leave, Inactive), Grid vs List view toggle.
   - Add/Edit Employee modal (Personal info, Department, Role, Salary, Emergency Contacts).
   - Employee Detail Profile page with tabs: Overview, Attendance, Leave history, Payslips, Documents.
3. **Attendance (`/attendance`)**:
   - Live Punch In/Out button with today's working hours timer.
   - Date picker filter, Monthly attendance log table with status badges (Present, Late, Half Day, Absent).
   - Summary statistics (Average hours, on-time percentage, total late entries).
4. **Leave Management (`/leaves`)**:
   - Leave Balance summary cards (Casual, Sick, Paid, Maternity).
   - "Apply for Leave" modal with date picker, leave type, and reason.
   - "Leave Requests" table with action buttons for Manager approval / rejection and status updates.
   - Leave Calendar view.
5. **Payroll (`/payroll`)**:
   - Monthly Payroll overview (Total Gross, Total Deductions, Total Net Pay).
   - Employee Payslip list with search & filter.
   - Interactive Payslip Viewer modal with printable layout (Earnings: Basic, HRA, Allowances; Deductions: PF, Tax, Insurance).
6. **Recruitment (`/recruitment`)**:
   - Job Openings listing with department tags and applicant count.
   - Candidate Pipeline Board (drag/click status update: Applied -> Screening -> Interview -> Offered -> Hired).
   - Add Job Opening & Add Candidate modals.
7. **Performance & OKRs (`/performance`)**:
   - Employee Goals tracking, completion progress bars, performance review rating cards.
8. **Settings (`/settings`)**:
   - Company Profile settings, Department & Designation manager, System preferences.

---

## Verification Plan

### Automated Verification
- Run `npm run build` or `npx ng build` to confirm zero TypeScript compilation errors or template syntax issues.
- Validate Angular 19 standalone component dependency injection and routing configuration.

### Manual Verification
- Launch local development server (`npm start` / `npx ng serve`) and test all core flows:
  - **Employee Management**: Adding a new employee, editing existing details, searching and filtering.
  - **Attendance**: Punching in/out, verifying live timer updates and attendance log recording.
  - **Leave Management**: Submitting a leave request, approving/rejecting from admin view, verifying balance deduction.
  - **Payroll**: Opening payslip modal, inspecting calculation and print formatting.
  - **Recruitment**: Moving candidates across pipeline stages.
  - **Theme**: Switching between Light and Dark mode across all screens.
