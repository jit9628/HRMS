package com.hrms.modulith.payroll;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, String> {

    List<Payslip> findByPayrollMonth(String payrollMonth);

    List<Payslip> findByEmployeeIdOrderByPayrollMonthDesc(String employeeId);

    Optional<Payslip> findByEmployeeIdAndPayrollMonth(String employeeId, String payrollMonth);

    @Query("SELECT SUM(p.grossEarnings), SUM(p.totalDeductions), SUM(p.netSalary) FROM Payslip p WHERE p.payrollMonth = :month")
    List<Object[]> getMonthlyTotals(String month);
}
