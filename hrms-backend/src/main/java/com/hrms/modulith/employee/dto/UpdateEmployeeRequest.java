package com.hrms.modulith.employee.dto;

import com.hrms.modulith.employee.Address;
import com.hrms.modulith.employee.BankDetails;
import com.hrms.modulith.employee.EmergencyContact;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateEmployeeRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String avatarUrl;
    private String department;
    private String designation;
    private String employmentType;
    private String status;
    private BigDecimal salary;
    private String managerName;
    private String location;

    private Address address;
    private EmergencyContact emergencyContact;
    private BankDetails bankDetails;
}
