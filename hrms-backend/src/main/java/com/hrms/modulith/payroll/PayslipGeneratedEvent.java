package com.hrms.modulith.payroll;

import org.jmolecules.event.annotation.DomainEvent;

import java.math.BigDecimal;

@DomainEvent
public record PayslipGeneratedEvent(
        String payslipId,
        String employeeId,
        String employeeName,
        String payrollMonth,
        BigDecimal netSalary
) {}
