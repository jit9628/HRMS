package com.hrms.modulith.performance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateGoalRequest {
    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    private String employeeName;

    @NotBlank(message = "Goal title is required")
    private String title;

    private String description;
    private String category;
    private String priority; // High, Medium, Low
    private LocalDate dueDate;
    private String assignedBy;
}
