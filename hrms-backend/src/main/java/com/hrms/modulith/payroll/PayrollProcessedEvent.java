package com.hrms.modulith.payroll;

import org.jmolecules.event.annotation.DomainEvent;

import java.math.BigDecimal;

@DomainEvent
public record PayrollProcessedEvent(
        String payrollMonth,
        int totalEmployeesProcessed,
        BigDecimal totalGrossPayout,
        BigDecimal totalNetPayout,
        BigDecimal totalDeductions
) {}
