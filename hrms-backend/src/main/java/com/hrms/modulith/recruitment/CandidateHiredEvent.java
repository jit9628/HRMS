package com.hrms.modulith.recruitment;

import org.jmolecules.event.annotation.DomainEvent;

import java.math.BigDecimal;
import java.time.LocalDate;

@DomainEvent
public record CandidateHiredEvent(
        String candidateId,
        String candidateName,
        String email,
        String phone,
        String jobTitle,
        String department,
        BigDecimal salaryOffered,
        LocalDate joinDate
) {}
