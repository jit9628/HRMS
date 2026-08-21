package com.hrms.modulith.performance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalDto {
    private String id;
    private String employeeId;
    private String employeeName;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private int progressPercent;
    private LocalDate dueDate;
    private String assignedBy;
}
