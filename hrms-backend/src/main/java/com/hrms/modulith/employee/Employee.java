package com.hrms.modulith.employee;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends BaseEntity {

    @Column(name = "company_id", nullable = false)
    private String companyId;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "employee_code", nullable = false, unique = true)
    private String employeeCode;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "designation", nullable = false)
    private String designation;

    @Column(name = "join_date", nullable = false)
    private LocalDate joinDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false)
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EmployeeStatus status;

    @Column(name = "salary", precision = 12, scale = 2)
    private BigDecimal salary;

    @Column(name = "manager_name")
    private String managerName;

    @Column(name = "location")
    private String location;

    @Embedded
    private Address address;

    @Embedded
    private EmergencyContact emergencyContact;

    @Embedded
    private BankDetails bankDetails;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
