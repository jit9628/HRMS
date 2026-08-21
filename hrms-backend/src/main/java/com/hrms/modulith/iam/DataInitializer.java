package com.hrms.modulith.iam;

import com.hrms.modulith.attendance.AttendanceRecord;
import com.hrms.modulith.attendance.AttendanceRecordRepository;
import com.hrms.modulith.attendance.AttendanceStatus;
import com.hrms.modulith.employee.*;
import com.hrms.modulith.leave.*;
import com.hrms.modulith.notification.Announcement;
import com.hrms.modulith.notification.AnnouncementRepository;
import com.hrms.modulith.organization.CompanyProfile;
import com.hrms.modulith.organization.CompanyProfileRepository;
import com.hrms.modulith.organization.Department;
import com.hrms.modulith.organization.DepartmentRepository;
import com.hrms.modulith.organization.Designation;
import com.hrms.modulith.organization.DesignationRepository;
import com.hrms.modulith.payroll.PaymentStatus;
import com.hrms.modulith.payroll.Payslip;
import com.hrms.modulith.payroll.PayslipRepository;
import com.hrms.modulith.performance.Goal;
import com.hrms.modulith.performance.GoalPriority;
import com.hrms.modulith.performance.GoalRepository;
import com.hrms.modulith.performance.GoalStatus;
import com.hrms.modulith.recruitment.Candidate;
import com.hrms.modulith.recruitment.CandidateRepository;
import com.hrms.modulith.recruitment.CandidateStage;
import com.hrms.modulith.recruitment.JobPosting;
import com.hrms.modulith.recruitment.JobPostingRepository;
import com.hrms.modulith.recruitment.JobStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserAccountRepository userRepository;
    private final UserMenuAssignmentRepository menuAssignmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final CompanyProfileRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final HolidayRepository holidayRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;
    private final GoalRepository goalRepository;
    private final PayslipRepository payslipRepository;
    private final AnnouncementRepository announcementRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            ensureJitendraCompanyAdmin();
            ensureDefaultMenus("superadmin@hrms.in", new String[] {"DASHBOARD", "EMPLOYEES", "ATTENDANCE", "LEAVES", "PAYROLL", "RECRUITMENT", "PERFORMANCE", "COMPANIES", "SETTINGS", "ACCESS_CONTROL"});
            ensureMenuAssignment("superadmin@hrms.in", "ACCESS_CONTROL");
            ensureDefaultMenus("jitendra@hrms.internal", new String[] {"DASHBOARD", "EMPLOYEES", "ATTENDANCE", "LEAVES", "PAYROLL", "RECRUITMENT", "PERFORMANCE", "SETTINGS"});
            return;
        }

        log.info("Seeding initial demo data for HRMS Modulith...");

        // 1. Company Profile
        // CompanyProfile company = CompanyProfile.builder()
        //         .code("COMP-001")
        //         .companyName("Acme Technologies Inc.")
        //         .tagline("Innovating Tomorrow's Enterprise Today")
        //         .industry("Information Technology & Cloud Services")
        //         .type("Headquarters")
        //         .status("Active")
        //         .website("https://acme.tech")
        //         .taxId("US99-8877665")
        //         .registrationNumber("CIN-U72200DL2018PTC123456")
        //         .phone("+1 (555) 234-5678")
        //         .email("contact@acme.tech")
        //         .address("500 Oracle Parkway, Suite 100")
        //         .city("Redwood City")
        //         .state("California")
        //         .zipCode("94065")
        //         .country("United States")
        //         .currency("USD ($)")
        //         .timeZone("America/Los_Angeles (PST)")
        //         .totalEmployees(28)
        //         .totalDepartments(6)
        //         .isDefault(true)
        //         .brandColor("#6366f1")
        //         .establishedDate("2018-04-15")
        //         .build();
        // company = companyRepository.save(company);

        // 2. Departments
        // Department dEng = departmentRepository.save(Department.builder()
        //         .companyId(company.getId()).name("Engineering").code("ENG")
        //         .headOfDepartment("Marcus Vance").totalEmployees(12).color("#6366f1").build());

        // Department dHr = departmentRepository.save(Department.builder()
        //         .companyId(company.getId()).name("Human Resources").code("HR")
        //         .headOfDepartment("Sophia Loren").totalEmployees(4).color("#ec4899").build());

        // Department dSales = departmentRepository.save(Department.builder()
        //         .companyId(company.getId()).name("Sales & Marketing").code("MKT")
        //         .headOfDepartment("Rachel Green").totalEmployees(5).color("#f59e0b").build());

        // Department dFinance = departmentRepository.save(Department.builder()
        //         .companyId(company.getId()).name("Finance & Accounts").code("FIN")
        //         .headOfDepartment("David Sterling").totalEmployees(3).color("#10b981").build());

        // 3. Designations
        // designationRepository.save(Designation.builder().companyId(company.getId()).title("Senior Software Engineer").department("Engineering").level("L4").build());
        // designationRepository.save(Designation.builder().companyId(company.getId()).title("Lead Architect").department("Engineering").level("L5").build());
        // designationRepository.save(Designation.builder().companyId(company.getId()).title("HR Director").department("Human Resources").level("L5").build());
        // designationRepository.save(Designation.builder().companyId(company.getId()).title("HR Generalist").department("Human Resources").level("L2").build());
        // designationRepository.save(Designation.builder().companyId(company.getId()).title("Product Marketing Manager").department("Sales & Marketing").level("L3").build());
        // designationRepository.save(Designation.builder().companyId(company.getId()).title("Financial Controller").department("Finance & Accounts").level("L4").build());

        // 4. Employees
        // Employee emp1 = Employee.builder()
        //         .companyId(company.getId())
        //         .companyName(company.getCompanyName())
        //         .employeeCode("EMP-001")
        //         .firstName("Jitendra")
        //         .lastName("Shukla")
        //         .email("jitendra@hrms.internal")
        //         .phone("+1 (555) 019-2834")
        //         .department("Engineering")
        //         .designation("Principal Solutions Architect")
        //         .joinDate(LocalDate.of(2021, 1, 15))
        //         .employmentType(EmploymentType.FULL_TIME)
        //         .status(EmployeeStatus.ACTIVE)
        //         .salary(BigDecimal.valueOf(145000))
        //         .managerName("Executive Leadership")
        //         .location("HQ - Redwood City")
        //         .address(Address.builder().street("100 Innovation Way").city("San Francisco").state("CA").zipCode("94105").country("USA").build())
        //         .emergencyContact(EmergencyContact.builder().name("Anita Shukla").relationship("Spouse").phone("+1 (555) 998-1122").build())
        //         .bankDetails(BankDetails.builder().accountNumber("987654321098").bankName("Silicon Valley Bank").ifscCode("SVBLUS33").pan("ABCPJ1234F").build())
        //         .build();
        // emp1 = employeeRepository.save(emp1);

        // 5. Users Accounts
        userRepository.save(UserAccount.builder()
                .email("superadmin@hrms.in")
                .password(passwordEncoder.encode("superadmin"))
                .name("Super Admin")
                .role(Role.SUPER_ADMIN)
                .designation("Platform Administrator")
                .department("IT Infrastructure")
                .avatarInitials("SA")
                //.companyId()
                //.companyName(company.getCompanyName())
                .active(true)
                .build());

            ensureJitendraCompanyAdmin();
            ensureDefaultMenus("superadmin@hrms.in", new String[] {"DASHBOARD", "EMPLOYEES", "ATTENDANCE", "LEAVES", "PAYROLL", "RECRUITMENT", "PERFORMANCE", "COMPANIES", "SETTINGS", "ACCESS_CONTROL"});
            ensureMenuAssignment("superadmin@hrms.in", "ACCESS_CONTROL");

        // userRepository.save(UserAccount.builder()
        //         .email("jitendra@hrms.internal")
        //         .password(passwordEncoder.encode("admin123"))
        //         .name("Jitendra Shukla")
        //         .role(Role.COMPANY_ADMIN)
        //         .designation("Principal Architect")
        //         .department("Engineering")
        //         .avatarInitials("JS")
        //         .companyId(company.getId())
        //         .companyName(company.getCompanyName())
        //         .employeeId(emp1.getId())
        //         .active(true)
        //         .build());

        // userRepository.save(UserAccount.builder()
        //         .email("hr@hrms.internal")
        //         .password(passwordEncoder.encode("hr123"))
        //         .name("Sophia Loren")
        //         .role(Role.HR_MANAGER)
        //         .designation("HR Director")
        //         .department("Human Resources")
        //         .avatarInitials("SL")
        //         .companyId(company.getId())
        //         .companyName(company.getCompanyName())
        //         .employeeId(emp2.getId())
        //         .active(true)
        //         .build());

        // userRepository.save(UserAccount.builder()
        //         .email("alex@hrms.internal")
        //         .password(passwordEncoder.encode("employee123"))
        //         .name("Alex Rivera")
        //         .role(Role.EMPLOYEE)
        //         .designation("Senior Fullstack Engineer")
        //         .department("Engineering")
        //         .avatarInitials("AR")
        //         .companyId(company.getId())
        //         .companyName(company.getCompanyName())
        //         .employeeId(emp3.getId())
        //         .active(true)
        //         .build());

        // 6. Leave Balances & Holidays
        // for (Employee emp : List.of(emp1, emp2, emp3, emp4)) {
        //     leaveBalanceRepository.save(LeaveBalance.builder()
        //             .employeeId(emp.getId())
        //             .casualLeaveTotal(12).casualLeaveUsed(2)
        //             .sickLeaveTotal(10).sickLeaveUsed(1)
        //             .paidLeaveTotal(18).paidLeaveUsed(4)
        //             .maternityLeaveTotal(84).maternityLeaveUsed(0)
        //             .build());
        // }

        // holidayRepository.save(Holiday.builder().name("New Year's Day").date(LocalDate.of(2026, 1, 1)).day("Thursday").type("Public").build());
        // holidayRepository.save(Holiday.builder().name("Martin Luther King Jr. Day").date(LocalDate.of(2026, 1, 19)).day("Monday").type("Public").build());
        // holidayRepository.save(Holiday.builder().name("Presidents' Day").date(LocalDate.of(2026, 2, 16)).day("Monday").type("Public").build());
        // holidayRepository.save(Holiday.builder().name("Memorial Day").date(LocalDate.of(2026, 5, 25)).day("Monday").type("Public").build());
        // holidayRepository.save(Holiday.builder().name("Independence Day").date(LocalDate.of(2026, 7, 4)).day("Saturday").type("Public").build());
        // holidayRepository.save(Holiday.builder().name("Labor Day").date(LocalDate.of(2026, 9, 7)).day("Monday").type("Public").build());
        // holidayRepository.save(Holiday.builder().name("Thanksgiving Day").date(LocalDate.of(2026, 11, 26)).day("Thursday").type("Public").build());
        // holidayRepository.save(Holiday.builder().name("Christmas Day").date(LocalDate.of(2026, 12, 25)).day("Friday").type("Public").build());

        // 7. Attendance Records (Today & Recent)
        // LocalDate today = LocalDate.now();
        // attendanceRepository.save(AttendanceRecord.builder()
        //         .employeeId(emp1.getId()).employeeName(emp1.getFullName())
        //         .date(today).clockIn(LocalTime.of(9, 15)).clockOut(LocalTime.of(18, 30))
        //         .workHours(9.25).status(AttendanceStatus.PRESENT).isOvertime(true).build());

        // attendanceRepository.save(AttendanceRecord.builder()
        //         .employeeId(emp2.getId()).employeeName(emp2.getFullName())
        //         .date(today).clockIn(LocalTime.of(9, 45)).status(AttendanceStatus.LATE)
        //         .notes("Traffic delay on 101 highway").build());

        // attendanceRepository.save(AttendanceRecord.builder()
        //         .employeeId(emp3.getId()).employeeName(emp3.getFullName())
        //         .date(today).clockIn(LocalTime.of(9, 0)).status(AttendanceStatus.PRESENT).build());

        // // 8. Job Postings & Candidates
        // JobPosting job1 = jobPostingRepository.save(JobPosting.builder()
        //         .title("Staff Backend Engineer (Java / Spring)")
        //         .department("Engineering").location("HQ / Hybrid").type("Full-Time")
        //         .openings(2).applicantsCount(8).experienceRange("6-10 years").salaryRange("$140k - $175k")
        //         .status(JobStatus.ACTIVE).postedDate(LocalDate.now().minusWeeks(2))
        //         .description("Lead the design and development of next-gen cloud microservices and moduliths.").build());

        // JobPosting job2 = jobPostingRepository.save(JobPosting.builder()
        //         .title("Senior Product Designer (UI/UX)")
        //         .department("Design").location("Remote").type("Full-Time")
        //         .openings(1).applicantsCount(14).experienceRange("4-7 years").salaryRange("$110k - $140k")
        //         .status(JobStatus.ACTIVE).postedDate(LocalDate.now().minusWeeks(3))
        //         .description("Create world-class enterprise SaaS user experiences and design systems.").build());

        // candidateRepository.save(Candidate.builder()
        //         .jobId(job1.getId()).jobTitle(job1.getTitle()).name("Samantha Reed")
        //         .email("samantha.reed@example.com").phone("+1 555-443-2211")
        //         .experienceYears(7.5).currentCompany("Fintech Global").appliedDate(LocalDate.now().minusDays(5))
        //         .stage(CandidateStage.INTERVIEW).rating(5).notes("Exceptional distributed systems design knowledge.").build());

        // candidateRepository.save(Candidate.builder()
        //         .jobId(job2.getId()).jobTitle(job2.getTitle()).name("Daniel Chen")
        //         .email("daniel.chen@example.com").phone("+1 555-889-1122")
        //         .experienceYears(5.0).currentCompany("Design Studio X").appliedDate(LocalDate.now().minusDays(10))
        //         .stage(CandidateStage.OFFERED).rating(5).notes("Stellar portfolio with dark mode enterprise dashboards.").build());

        // // 9. Performance Goals
        // goalRepository.save(Goal.builder()
        //         .employeeId(emp1.getId()).employeeName(emp1.getFullName())
        //         .title("Architect Spring Modulith HRMS Backend")
        //         .description("Decompose monolithic services into clean DDD modular monolith with event-driven boundaries.")
        //         .category("Strategic").priority(GoalPriority.HIGH).status(GoalStatus.IN_PROGRESS)
        //         .progressPercent(85).dueDate(LocalDate.of(2026, 9, 30)).assignedBy("CTO").build());

        // goalRepository.save(Goal.builder()
        //         .employeeId(emp3.getId()).employeeName(emp3.getFullName())
        //         .title("Upgrade Angular 19 Signal State Management")
        //         .description("Migrate all store components to native Signals and Angular 19 control flow.")
        //         .category("Operational").priority(GoalPriority.HIGH).status(GoalStatus.COMPLETED)
        //         .progressPercent(100).dueDate(LocalDate.of(2026, 8, 15)).assignedBy("Jitendra Shukla").build());

        // // 10. Sample Payslips
        // payslipRepository.save(Payslip.builder()
        //         .payrollMonth("January 2026")
        //         .employeeId(emp1.getId()).employeeName(emp1.getFullName()).employeeCode(emp1.getEmployeeCode())
        //         .designation(emp1.getDesignation()).department(emp1.getDepartment())
        //         .bankAccount("987654321098").pan("ABCPJ1234F").workingDays(22).paidDays(22).lossOfPayDays(0)
        //         .basicSalary(BigDecimal.valueOf(6041.67)).hra(BigDecimal.valueOf(2416.67)).specialAllowance(BigDecimal.valueOf(1812.50))
        //         .conveyanceAllowance(BigDecimal.valueOf(604.17)).medicalAllowance(BigDecimal.valueOf(604.17)).performanceBonus(BigDecimal.valueOf(604.17))
        //         .grossEarnings(BigDecimal.valueOf(12083.35))
        //         .providentFund(BigDecimal.valueOf(725.00)).professionalTax(BigDecimal.valueOf(200.00))
        //         .taxDeductedAtSource(BigDecimal.valueOf(604.17)).healthInsurance(BigDecimal.valueOf(150.00))
        //         .totalDeductions(BigDecimal.valueOf(1679.17))
        //         .netSalary(BigDecimal.valueOf(10404.18))
        //         .paymentStatus(PaymentStatus.PAID).paymentDate(LocalDate.of(2026, 1, 31)).build());

        // // 11. Announcements
        // announcementRepository.save(Announcement.builder()
        //         .title("Q3 2026 All-Hands Town Hall & Product Roadmap")
        //         .content("Join us this Thursday at 2:00 PM PST for the global quarterly townhall to celebrate our recent product milestones and reveal upcoming enterprise features!")
        //         .date(LocalDate.now().minusDays(2)).author("Executive Leadership").category("Event").priority("Normal").build());

        // announcementRepository.save(Announcement.builder()
        //         .title("Annual Health & Wellness Benefit Renewal")
        //         .content("The open enrollment window for annual healthcare, dental, and gym memberships is now open until the end of the month.")
        //         .date(LocalDate.now().minusDays(6)).author("People Operations").category("Policy").priority("Urgent").build());

        // log.info("HRMS Demo Data initialization complete! Ready for login with admin@hrms.internal / admin123");
    }

    private void ensureJitendraCompanyAdmin() {
        if (userRepository.findByEmail("jitendra@hrms.internal").isPresent()) {
            return;
        }

        userRepository.save(UserAccount.builder()
                .email("jitendra@hrms.internal")
                .password(passwordEncoder.encode("admin123"))
                .name("Jitendra Shukla")
                .role(Role.COMPANY_ADMIN)
                .designation("Principal Architect")
                .department("Engineering")
                .avatarInitials("JS")
                .companyId("COMP-001")
                .companyName("Acme Technologies Inc.")
                .active(true)
                .build());
    }

    private void ensureDefaultMenus(String email, String[] featureCodes) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (!menuAssignmentRepository.findByUserId(user.getId()).isEmpty()) {
                return;
            }
            for (String featureCode : featureCodes) {
                menuAssignmentRepository.save(UserMenuAssignment.builder()
                        .userId(user.getId())
                        .featureCode(featureCode)
                        .enabled(true)
                        .build());
            }
        });
    }

    private void ensureMenuAssignment(String email, String featureCode) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (menuAssignmentRepository.findByUserIdAndFeatureCode(user.getId(), featureCode).isEmpty()) {
                menuAssignmentRepository.save(UserMenuAssignment.builder()
                        .userId(user.getId())
                        .featureCode(featureCode)
                        .enabled(true)
                        .build());
            }
        });
    }
}
