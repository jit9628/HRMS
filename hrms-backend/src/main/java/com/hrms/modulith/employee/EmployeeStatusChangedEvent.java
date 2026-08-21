package com.hrms.modulith.employee;

import org.jmolecules.event.annotation.DomainEvent;

@DomainEvent
public record EmployeeStatusChangedEvent(
        String employeeId,
        EmployeeStatus oldStatus,
        EmployeeStatus newStatus
) {}
