package com.hrms.modulith.recruitment.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCandidateRequest {
    @NotBlank(message = "Job ID is required")
    private String jobId;

    private String jobTitle;

    @NotBlank(message = "Candidate name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;

    private String phone;
    private double experienceYears;
    private String currentCompany;
    private String notes;
    private int rating = 4;
}
