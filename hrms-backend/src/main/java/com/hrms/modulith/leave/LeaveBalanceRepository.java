package com.hrms.modulith.leave;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, String> {

    Optional<LeaveBalance> findByEmployeeId(String employeeId);
}
