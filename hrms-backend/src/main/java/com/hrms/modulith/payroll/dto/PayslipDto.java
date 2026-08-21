package com.hrms.modulith.payroll.dto;

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
public class PayslipDto {
    private String id;
    private String payrollMonth;
    private String employeeId;
    private String employeeName;
    private String employeeCode;
    private String designation;
    private String department;
    private String bankAccount;
    private String pan;
    private int workingDays;
    private int paidDays;
    private int lossOfPayDays;

    // Earnings
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal specialAllowance;
    private BigDecimal conveyanceAllowance;
    private BigDecimal medicalAllowance;
    private BigDecimal performanceBonus;
    private BigDecimal grossEarnings;

    // Deductions
    private BigDecimal providentFund;
    private BigDecimal professionalTax;
    private BigDecimal taxDeductedAtSource;
    private BigDecimal healthInsurance;
    private BigDecimal totalDeductions;

    // Net
    private BigDecimal netSalary;
    private String paymentStatus;
    private LocalDate paymentDate;
}
