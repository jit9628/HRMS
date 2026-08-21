package com.hrms.modulith.payroll;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payslips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payslip extends BaseEntity {

    @Column(name = "payroll_month", nullable = false)
    private String payrollMonth; // e.g. "January 2026", "2026-01"

    @Column(name = "employee_id", nullable = false)
    private String employeeId;

    @Column(name = "employee_name", nullable = false)
    private String employeeName;

    @Column(name = "employee_code", nullable = false)
    private String employeeCode;

    @Column(name = "designation")
    private String designation;

    @Column(name = "department")
    private String department;

    @Column(name = "bank_account")
    private String bankAccount;

    @Column(name = "pan")
    private String pan;

    @Column(name = "working_days")
    private int workingDays;

    @Column(name = "paid_days")
    private int paidDays;

    @Column(name = "loss_of_pay_days")
    private int lossOfPayDays;

    // Earnings
    @Column(name = "basic_salary", precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "hra", precision = 12, scale = 2)
    private BigDecimal hra;

    @Column(name = "special_allowance", precision = 12, scale = 2)
    private BigDecimal specialAllowance;

    @Column(name = "conveyance_allowance", precision = 12, scale = 2)
    private BigDecimal conveyanceAllowance;

    @Column(name = "medical_allowance", precision = 12, scale = 2)
    private BigDecimal medicalAllowance;

    @Column(name = "performance_bonus", precision = 12, scale = 2)
    private BigDecimal performanceBonus;

    @Column(name = "gross_earnings", precision = 12, scale = 2)
    private BigDecimal grossEarnings;

    // Deductions
    @Column(name = "provident_fund", precision = 12, scale = 2)
    private BigDecimal providentFund;

    @Column(name = "professional_tax", precision = 12, scale = 2)
    private BigDecimal professionalTax;

    @Column(name = "tds", precision = 12, scale = 2)
    private BigDecimal taxDeductedAtSource;

    @Column(name = "health_insurance", precision = 12, scale = 2)
    private BigDecimal healthInsurance;

    @Column(name = "total_deductions", precision = 12, scale = 2)
    private BigDecimal totalDeductions;

    // Net Salary
    @Column(name = "net_salary", precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "payment_date")
    private LocalDate paymentDate;
}
