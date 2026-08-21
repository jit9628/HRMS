package com.hrms.modulith.leave;

import org.jmolecules.event.annotation.DomainEvent;

import java.time.LocalDate;

@DomainEvent
public record LeaveApprovedEvent(
        String leaveRequestId,
        String employeeId,
        String employeeName,
        LocalDate startDate,
        LocalDate endDate,
        String leaveType,
        double totalDays
) {}
