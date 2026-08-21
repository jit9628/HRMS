package com.hrms.modulith.recruitment;

import com.hrms.modulith.common.exception.ResourceNotFoundException;
import com.hrms.modulith.recruitment.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecruitmentService {

    private final JobPostingRepository jobPostingRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationEventPublisher eventPublisher;

    // Jobs
    @Transactional(readOnly = true)
    public List<JobPostingDto> getAllJobs(String status, String department) {
        List<JobPosting> list;
        if (status != null) {
            list = jobPostingRepository.findByStatus(JobStatus.fromString(status));
        } else if (department != null) {
            list = jobPostingRepository.findByDepartment(department);
        } else {
            list = jobPostingRepository.findAll();
        }

        return list.stream().map(this::mapJobToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobPostingDto getJobById(String id) {
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", id));
        return mapJobToDto(job);
    }

    @Transactional
    public JobPostingDto createJob(CreateJobRequest req) {
        JobPosting job = JobPosting.builder()
                .title(req.getTitle())
                .department(req.getDepartment())
                .location(req.getLocation() != null ? req.getLocation() : "HQ - New York")
                .type(req.getType() != null ? req.getType() : "Full-Time")
                .openings(req.getOpenings() > 0 ? req.getOpenings() : 1)
                .applicantsCount(0)
                .experienceRange(req.getExperienceRange() != null ? req.getExperienceRange() : "2-5 years")
                .salaryRange(req.getSalaryRange() != null ? req.getSalaryRange() : "$80k - $110k")
                .status(JobStatus.ACTIVE)
                .postedDate(LocalDate.now())
                .description(req.getDescription())
                .build();

        job = jobPostingRepository.save(job);
        return mapJobToDto(job);
    }

    // Candidates
    @Transactional(readOnly = true)
    public List<CandidateDto> getCandidates(String jobId, String stage) {
        List<Candidate> list;
        if (jobId != null) {
            list = candidateRepository.findByJobId(jobId);
        } else if (stage != null) {
            list = candidateRepository.findByStage(CandidateStage.fromString(stage));
        } else {
            list = candidateRepository.findAll();
        }

        return list.stream().map(this::mapCandidateToDto).collect(Collectors.toList());
    }

    @Transactional
    public CandidateDto createCandidate(CreateCandidateRequest req) {
        JobPosting job = jobPostingRepository.findById(req.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("JobPosting", "id", req.getJobId()));

        Candidate candidate = Candidate.builder()
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .experienceYears(req.getExperienceYears())
                .currentCompany(req.getCurrentCompany())
                .appliedDate(LocalDate.now())
                .stage(CandidateStage.APPLIED)
                .rating(req.getRating())
                .notes(req.getNotes())
                .build();

        candidate = candidateRepository.save(candidate);

        job.setApplicantsCount(job.getApplicantsCount() + 1);
        jobPostingRepository.save(job);

        return mapCandidateToDto(candidate);
    }

    @Transactional
    public CandidateDto updateStage(String id, String stageStr) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", "id", id));

        CandidateStage newStage = CandidateStage.fromString(stageStr);
        CandidateStage oldStage = candidate.getStage();
        candidate.setStage(newStage);
        candidate = candidateRepository.save(candidate);

        // If candidate is HIRED, publish CandidateHiredEvent!
        if (newStage == CandidateStage.HIRED && oldStage != CandidateStage.HIRED) {
            JobPosting job = jobPostingRepository.findById(candidate.getJobId()).orElse(null);
            String dept = job != null ? job.getDepartment() : "Engineering";

            eventPublisher.publishEvent(new CandidateHiredEvent(
                    candidate.getId(),
                    candidate.getName(),
                    candidate.getEmail(),
                    candidate.getPhone(),
                    candidate.getJobTitle(),
                    dept,
                    BigDecimal.valueOf(85000),
                    LocalDate.now().plusWeeks(2)
            ));

            log.info("Candidate {} marked as HIRED. Published CandidateHiredEvent!", candidate.getName());
        }

        return mapCandidateToDto(candidate);
    }

    private JobPostingDto mapJobToDto(JobPosting j) {
        return JobPostingDto.builder()
                .id(j.getId())
                .title(j.getTitle())
                .department(j.getDepartment())
                .location(j.getLocation())
                .type(j.getType())
                .openings(j.getOpenings())
                .applicantsCount(j.getApplicantsCount())
                .experienceRange(j.getExperienceRange())
                .salaryRange(j.getSalaryRange())
                .status(j.getStatus().getDisplayName())
                .postedDate(j.getPostedDate())
                .description(j.getDescription())
                .build();
    }

    private CandidateDto mapCandidateToDto(Candidate c) {
        return CandidateDto.builder()
                .id(c.getId())
                .jobId(c.getJobId())
                .jobTitle(c.getJobTitle())
                .name(c.getName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .experienceYears(c.getExperienceYears())
                .currentCompany(c.getCurrentCompany())
                .appliedDate(c.getAppliedDate())
                .stage(c.getStage().getDisplayName())
                .rating(c.getRating())
                .notes(c.getNotes())
                .resumeUrl(c.getResumeUrl())
                .build();
    }
}
