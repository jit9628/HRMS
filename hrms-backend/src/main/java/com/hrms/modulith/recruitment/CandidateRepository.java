package com.hrms.modulith.recruitment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, String> {

    List<Candidate> findByJobId(String jobId);

    List<Candidate> findByStage(CandidateStage stage);

    long countByJobId(String jobId);
}
