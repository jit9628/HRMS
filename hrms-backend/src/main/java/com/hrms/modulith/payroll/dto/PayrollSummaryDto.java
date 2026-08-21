package com.hrms.modulith.payroll.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollSummaryDto {
    private String payrollMonth;
    private int totalEmployees;
    private BigDecimal totalGross;
    private BigDecimal totalDeductions;
    private BigDecimal totalNetPay;
    private int processedCount;
    private int paidCount;
    private int pendingCount;
}
