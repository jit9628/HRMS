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
public class JobPostingDto {
    private String id;
    private String title;
    private String department;
    private String location;
    private String type;
    private int openings;
    private int applicantsCount;
    private String experienceRange;
    private String salaryRange;
    private String status;
    private LocalDate postedDate;
    private String description;
}
