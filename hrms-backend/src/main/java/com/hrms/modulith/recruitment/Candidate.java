package com.hrms.modulith.recruitment;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate extends BaseEntity {

    @Column(name = "job_id", nullable = false)
    private String jobId;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "experience_years")
    private double experienceYears;

    @Column(name = "current_company")
    private String currentCompany;

    @Column(name = "applied_date")
    private LocalDate appliedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false)
    private CandidateStage stage;

    @Column(name = "rating")
    private int rating; // 1 to 5

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "resume_url")
    private String resumeUrl;
}
