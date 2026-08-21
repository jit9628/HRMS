package com.hrms.modulith.leave;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, String> {

    List<Holiday> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);
}
