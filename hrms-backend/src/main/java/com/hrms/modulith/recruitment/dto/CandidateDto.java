package com.hrms.modulith.recruitment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDto {
    private String id;
    private String jobId;
    private String jobTitle;
    private String name;
    private String email;
    private String phone;
    private double experienceYears;
    private String currentCompany;
    private LocalDate appliedDate;
    private String stage;
    private int rating;
    private String notes;
    private String resumeUrl;
}
