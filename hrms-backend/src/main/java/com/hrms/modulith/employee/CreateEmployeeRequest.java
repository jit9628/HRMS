package com.hrms.modulith.employee;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateEmployeeRequest {

    private String companyId;
    private String companyName;

    @NotBlank(message = "Employee code is required")
    private String employeeCode;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;

    private String phone;
    private String avatarUrl;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Designation is required")
    private String designation;

    @NotNull(message = "Join date is required")
    private LocalDate joinDate;

    private String employmentType; // Full-Time, Part-Time, Contract, Intern
    private String status;         // Active, On Leave, Terminated, Probation
    private BigDecimal salary;
    private String managerName;
    private String location;

    private Address address;
    private EmergencyContact emergencyContact;
    private BankDetails bankDetails;
}
