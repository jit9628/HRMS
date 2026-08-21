package com.hrms.modulith.employee;

import org.jmolecules.event.annotation.DomainEvent;

import java.math.BigDecimal;
import java.time.LocalDate;

@DomainEvent
public record EmployeeOnboardedEvent(
        String employeeId,
        String employeeCode,
        String firstName,
        String lastName,
        String email,
        String department,
        String designation,
        String companyId,
        BigDecimal salary,
        LocalDate joinDate
) {}
