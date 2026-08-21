package com.hrms.modulith.leave.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {
    private String id;
    private String employeeId;
    private String employeeName;
    private String department;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private double totalDays;
    private String reason;
    private String status;
    private LocalDate appliedOn;
    private String approverComments;
}
