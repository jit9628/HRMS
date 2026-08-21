package com.hrms.modulith.performance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, String> {

    List<Goal> findByEmployeeId(String employeeId);

    List<Goal> findByStatus(GoalStatus status);
}
