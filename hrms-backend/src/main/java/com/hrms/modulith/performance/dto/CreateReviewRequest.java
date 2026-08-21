package com.hrms.modulith.performance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReviewRequest {
    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    private String employeeName;
    private String department;

    @NotBlank(message = "Review cycle is required")
    private String reviewCycle;

    private String reviewerName;
    private double technicalScore;
    private double communicationScore;
    private double leadershipScore;
    private String feedback;
}
