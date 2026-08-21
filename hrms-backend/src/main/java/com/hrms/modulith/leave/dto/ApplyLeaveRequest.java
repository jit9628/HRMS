package com.hrms.modulith.leave.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ApplyLeaveRequest {
    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    private String employeeName;
    private String department;

    @NotBlank(message = "Leave type is required")
    private String leaveType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private double totalDays;

    @NotBlank(message = "Reason is required")
    private String reason;
}
