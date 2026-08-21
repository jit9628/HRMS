package com.hrms.modulith.employee.dto;

import com.hrms.modulith.employee.Address;
import com.hrms.modulith.employee.BankDetails;
import com.hrms.modulith.employee.EmergencyContact;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {
    private String id;
    private String companyId;
    private String companyName;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String avatarUrl;
    private String department;
    private String designation;
    private LocalDate joinDate;
    private String employmentType;
    private String status;
    private BigDecimal salary;
    private String managerName;
    private String location;
    private Address address;
    private EmergencyContact emergencyContact;
    private BankDetails bankDetails;
}
