package com.hrms.modulith.employee;

import org.jmolecules.event.annotation.DomainEvent;

import java.math.BigDecimal;

@DomainEvent
public record EmployeeSalaryUpdatedEvent(
        String employeeId,
        BigDecimal oldSalary,
        BigDecimal newSalary
) {}
