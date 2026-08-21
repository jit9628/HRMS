package com.hrms.modulith.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeStatsDto {
    private long totalEmployees;
    private long activeEmployees;
    private long onLeaveEmployees;
    private long probationEmployees;
    private long terminatedEmployees;
    private Map<String, Long> departmentDistribution;
}
