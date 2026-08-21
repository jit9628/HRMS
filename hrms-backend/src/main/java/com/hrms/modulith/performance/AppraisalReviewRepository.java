package com.hrms.modulith.performance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppraisalReviewRepository extends JpaRepository<AppraisalReview, String> {

    List<AppraisalReview> findByEmployeeId(String employeeId);

    List<AppraisalReview> findByReviewCycle(String reviewCycle);
}
