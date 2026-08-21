package com.hrms.modulith.recruitment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateJobRequest {
    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Department is required")
    private String department;

    private String location;
    private String type; // Full-Time, Part-Time, Remote, Hybrid
    private int openings = 1;
    private String experienceRange;
    private String salaryRange;
    private String description;
}
