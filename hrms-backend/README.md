# HRMS Spring Boot 3 Modular Monolith (Spring Modulith)

An enterprise-grade **Human Resource Management System (HRMS)** backend built as a **Modular Monolith** using **Spring Boot 3.3.5**, **Java 21**, and **Spring Modulith**.

---

## 🏛 Architecture Overview

This project is structured using Domain-Driven Design (DDD) principles where each business domain is encapsulated inside its own autonomous Spring Modulith module. Modules communicate through **loosely coupled domain events** and public APIs, preventing spaghetti code while maintaining the operational simplicity of a single deployable unit.

### Modules:

| Module | Package | Responsibility | Events Published / Handled |
| :--- | :--- | :--- | :--- |
| **`iam`** | `com.hrms.modulith.iam` | Authentication, RBAC, JWT tokens, User accounts | Authenticates users, seed initial admins |
| **`organization`**| `com.hrms.modulith.organization`| Companies, Subsidiaries, Departments, Designations | Organization metadata management |
| **`employee`** | `com.hrms.modulith.employee` | Employee directory, lifecycle, compensation details | 📤 `EmployeeOnboardedEvent`<br>📤 `EmployeeSalaryUpdatedEvent`<br>📥 `CandidateHiredEvent` |
| **`attendance`**| `com.hrms.modulith.attendance`| Live clock in/out, work hours, daily timesheets | 📥 `LeaveApprovedEvent` |
| **`leave`** | `com.hrms.modulith.leave` | Leave balance quotas, application, manager approval | 📤 `LeaveAppliedEvent`<br>📤 `LeaveApprovedEvent`<br>📥 `EmployeeOnboardedEvent` |
| **`payroll`** | `com.hrms.modulith.payroll` | Monthly payroll calculation, tax/deductions, payslips | 📤 `PayrollProcessedEvent`<br>📤 `PayslipGeneratedEvent` |
| **`recruitment`**| `com.hrms.modulith.recruitment`| Job openings, candidates, ATS pipeline | 📤 `CandidateHiredEvent` |
| **`performance`**| `com.hrms.modulith.performance`| OKRs, goals tracking, manager appraisal reviews | Goal & review lifecycle |
| **`notification`**| `com.hrms.modulith.notification`| Broadcast announcements, personal alerts | 📥 Multicasts all system events into notifications |
| **`common`** | `com.hrms.modulith.common` | Shared base entity, security filter, JWT provider, global exception handler | Open Shared Kernel |

---

## 🚀 Getting Started

### Prerequisites
- **Java 21** or later
- **Maven 3.8+**

### Running the Application

```powershell
# Navigate to the backend directory
cd hrms-backend

# Run with Spring Boot Maven plugin
mvn spring-boot:run
```

The server will start on **`https://hrms.divijixtechnology.com`**.

---

## 🔑 Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@hrms.internal` | `admin123` |
| **Company Admin** | `jitendra@hrms.internal` | `admin123` |
| **HR Manager** | `hr@hrms.internal` | `hr123` |
| **Employee** | `alex@hrms.internal` | `employee123` |

---

## 📖 API Documentation & Tools

- **Swagger UI Interactive Documentation**: [https://hrms.divijixtechnology.com/swagger-ui.html](https://hrms.divijixtechnology.com/swagger-ui.html)
- **OpenAPI JSON Spec**: [https://hrms.divijixtechnology.com/api-docs](https://hrms.divijixtechnology.com/api-docs)
- **H2 Database Web Console**: [https://hrms.divijixtechnology.com/h2-console](https://hrms.divijixtechnology.com/h2-console)
  - JDBC URL: `jdbc:h2:mem:hrmsdb`
  - Username: `sa`
  - Password: *(leave blank)*
- **Spring Boot Actuator Health**: [https://hrms.divijixtechnology.com/actuator/health](https://hrms.divijixtechnology.com/actuator/health)
- **Spring Modulith Actuator Endpoint**: [https://hrms.divijixtechnology.com/actuator/modulith](https://hrms.divijixtechnology.com/actuator/modulith)

---

## 🧪 Testing & Architectural Verification

Spring Modulith automatically tests that package boundaries are respected and generates PlantUML & C4 architecture diagrams:

```powershell
mvn clean test
```

Generated architectural documentation will be placed under `target/spring-modulith-docs/`.
