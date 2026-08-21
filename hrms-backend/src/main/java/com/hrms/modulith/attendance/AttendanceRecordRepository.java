package com.hrms.modulith.attendance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, String> {

    Optional<AttendanceRecord> findByEmployeeIdAndDate(String employeeId, LocalDate date);

    List<AttendanceRecord> findByEmployeeIdOrderByDateDesc(String employeeId);

    List<AttendanceRecord> findByDate(LocalDate date);

    List<AttendanceRecord> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<AttendanceRecord> findByEmployeeIdAndDateBetween(String employeeId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.date = :date AND a.status = :status")
    long countByDateAndStatus(LocalDate date, AttendanceStatus status);
}
