package com.hrms.modulith.recruitment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, String> {

    List<JobPosting> findByStatus(JobStatus status);

    List<JobPosting> findByDepartment(String department);
}
