package com.hrms.modulith.leave;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, String> {

    List<LeaveRequest> findByEmployeeIdOrderByAppliedOnDesc(String employeeId);

    List<LeaveRequest> findByStatusOrderByAppliedOnDesc(LeaveStatus status);

    List<LeaveRequest> findByStartDateBetweenOrEndDateBetween(LocalDate s1, LocalDate e1, LocalDate s2, LocalDate e2);
}
