package com.hrms.modulith.leave;

import org.jmolecules.event.annotation.DomainEvent;

import java.time.LocalDate;

@DomainEvent
public record LeaveAppliedEvent(
        String leaveRequestId,
        String employeeId,
        String employeeName,
        String department,
        String leaveType,
        LocalDate startDate,
        LocalDate endDate,
        double totalDays,
        String reason
) {}
