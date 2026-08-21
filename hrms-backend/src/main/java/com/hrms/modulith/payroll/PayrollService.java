package com.hrms.modulith.payroll;

import com.hrms.modulith.common.exception.BadRequestException;
import com.hrms.modulith.common.exception.ResourceNotFoundException;
import com.hrms.modulith.employee.EmployeeService;
import com.hrms.modulith.employee.EmployeeDto;
import com.hrms.modulith.payroll.dto.GeneratePayrollRequest;
import com.hrms.modulith.payroll.dto.PayrollSummaryDto;
import com.hrms.modulith.payroll.dto.PayslipDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayslipRepository payslipRepository;
    private final EmployeeService employeeService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public List<PayslipDto> generateMonthlyPayroll(GeneratePayrollRequest req) {
        String month = req.getPayrollMonth();
        int totalWorkingDays = req.getTotalWorkingDays() > 0 ? req.getTotalWorkingDays() : 22;

        List<EmployeeDto> employees = employeeService.getAllEmployeesList();
        List<Payslip> generatedPayslips = new ArrayList<>();

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;

        for (EmployeeDto emp : employees) {
            if ("Terminated".equalsIgnoreCase(emp.getStatus())) {
                continue;
            }

            BigDecimal baseCtc = emp.getSalary() != null && emp.getSalary().compareTo(BigDecimal.ZERO) > 0
                    ? emp.getSalary()
                    : BigDecimal.valueOf(75000);

            // 50% Basic, 20% HRA, 15% Special, 5% Conveyance, 5% Medical, 5% Bonus
            BigDecimal basic = baseCtc.multiply(BigDecimal.valueOf(0.50)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal hra = baseCtc.multiply(BigDecimal.valueOf(0.20)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal special = baseCtc.multiply(BigDecimal.valueOf(0.15)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal conveyance = baseCtc.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal medical = baseCtc.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal bonus = baseCtc.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);

            BigDecimal gross = basic.add(hra).add(special).add(conveyance).add(medical).add(bonus);

            // Deductions: PF (12% of basic), Professional Tax (200), TDS (5% gross), Insurance (1500)
            BigDecimal pf = basic.multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal pt = BigDecimal.valueOf(200.00);
            BigDecimal tds = gross.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal insurance = BigDecimal.valueOf(1500.00);

            BigDecimal deductions = pf.add(pt).add(tds).add(insurance);
            BigDecimal net = gross.subtract(deductions);

            int paidDays = totalWorkingDays;
            int lopDays = 0;

            // Upsert payslip for the month
            Optional<Payslip> existing = payslipRepository.findByEmployeeIdAndPayrollMonth(emp.getId(), month);
            Payslip payslip = existing.orElseGet(Payslip::new);

            payslip.setPayrollMonth(month);
            payslip.setEmployeeId(emp.getId());
            payslip.setEmployeeName(emp.getFirstName() + " " + emp.getLastName());
            payslip.setEmployeeCode(emp.getEmployeeCode());
            payslip.setDesignation(emp.getDesignation());
            payslip.setDepartment(emp.getDepartment());
            payslip.setBankAccount(emp.getBankDetails() != null ? emp.getBankDetails().getAccountNumber() : "ACC-XXXX-9901");
            payslip.setPan(emp.getBankDetails() != null ? emp.getBankDetails().getPan() : "ABCDE1234F");
            payslip.setWorkingDays(totalWorkingDays);
            payslip.setPaidDays(paidDays);
            payslip.setLossOfPayDays(lopDays);

            payslip.setBasicSalary(basic);
            payslip.setHra(hra);
            payslip.setSpecialAllowance(special);
            payslip.setConveyanceAllowance(conveyance);
            payslip.setMedicalAllowance(medical);
            payslip.setPerformanceBonus(bonus);
            payslip.setGrossEarnings(gross);

            payslip.setProvidentFund(pf);
            payslip.setProfessionalTax(pt);
            payslip.setTaxDeductedAtSource(tds);
            payslip.setHealthInsurance(insurance);
            payslip.setTotalDeductions(deductions);

            payslip.setNetSalary(net);
            payslip.setPaymentStatus(PaymentStatus.PROCESSING);
            payslip.setPaymentDate(LocalDate.now());

            payslip = payslipRepository.save(payslip);
            generatedPayslips.add(payslip);

            totalGross = totalGross.add(gross);
            totalNet = totalNet.add(net);
            totalDeductions = totalDeductions.add(deductions);

            eventPublisher.publishEvent(new PayslipGeneratedEvent(
                    payslip.getId(),
                    emp.getId(),
                    emp.getFirstName() + " " + emp.getLastName(),
                    month,
                    net
            ));
        }

        eventPublisher.publishEvent(new PayrollProcessedEvent(
                month,
                generatedPayslips.size(),
                totalGross,
                totalNet,
                totalDeductions
        ));

        log.info("Processed monthly payroll for {} ({} employees, Net Payout: {})",
                month, generatedPayslips.size(), totalNet);

        return generatedPayslips.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PayslipDto> getPayslips(String month, String employeeId) {
        List<Payslip> list;
        if (month != null && employeeId != null) {
            list = payslipRepository.findByEmployeeIdAndPayrollMonth(employeeId, month)
                    .map(List::of).orElseGet(List::of);
        } else if (month != null) {
            list = payslipRepository.findByPayrollMonth(month);
        } else if (employeeId != null) {
            list = payslipRepository.findByEmployeeIdOrderByPayrollMonthDesc(employeeId);
        } else {
            list = payslipRepository.findAll();
        }

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PayslipDto getPayslipById(String id) {
        Payslip p = payslipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip", "id", id));
        return mapToDto(p);
    }

    @Transactional
    public PayslipDto markAsPaid(String id) {
        Payslip p = payslipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip", "id", id));

        p.setPaymentStatus(PaymentStatus.PAID);
        p.setPaymentDate(LocalDate.now());
        p = payslipRepository.save(p);

        return mapToDto(p);
    }

    @Transactional(readOnly = true)
    public PayrollSummaryDto getPayrollSummary(String month) {
        String targetMonth = month != null ? month : "January 2026";
        List<Payslip> list = payslipRepository.findByPayrollMonth(targetMonth);

        BigDecimal gross = BigDecimal.ZERO;
        BigDecimal deductions = BigDecimal.ZERO;
        BigDecimal net = BigDecimal.ZERO;
        int paid = 0;
        int pending = 0;
        int processing = 0;

        for (Payslip p : list) {
            if (p.getGrossEarnings() != null) gross = gross.add(p.getGrossEarnings());
            if (p.getTotalDeductions() != null) deductions = deductions.add(p.getTotalDeductions());
            if (p.getNetSalary() != null) net = net.add(p.getNetSalary());

            if (p.getPaymentStatus() == PaymentStatus.PAID) paid++;
            else if (p.getPaymentStatus() == PaymentStatus.PENDING) pending++;
            else processing++;
        }

        return PayrollSummaryDto.builder()
                .payrollMonth(targetMonth)
                .totalEmployees(list.size())
                .totalGross(gross)
                .totalDeductions(deductions)
                .totalNetPay(net)
                .processedCount(list.size())
                .paidCount(paid)
                .pendingCount(pending)
                .build();
    }

    private PayslipDto mapToDto(Payslip p) {
        return PayslipDto.builder()
                .id(p.getId())
                .payrollMonth(p.getPayrollMonth())
                .employeeId(p.getEmployeeId())
                .employeeName(p.getEmployeeName())
                .employeeCode(p.getEmployeeCode())
                .designation(p.getDesignation())
                .department(p.getDepartment())
                .bankAccount(p.getBankAccount())
                .pan(p.getPan())
                .workingDays(p.getWorkingDays())
                .paidDays(p.getPaidDays())
                .lossOfPayDays(p.getLossOfPayDays())
                .basicSalary(p.getBasicSalary())
                .hra(p.getHra())
                .specialAllowance(p.getSpecialAllowance())
                .conveyanceAllowance(p.getConveyanceAllowance())
                .medicalAllowance(p.getMedicalAllowance())
                .performanceBonus(p.getPerformanceBonus())
                .grossEarnings(p.getGrossEarnings())
                .providentFund(p.getProvidentFund())
                .professionalTax(p.getProfessionalTax())
                .taxDeductedAtSource(p.getTaxDeductedAtSource())
                .healthInsurance(p.getHealthInsurance())
                .totalDeductions(p.getTotalDeductions())
                .netSalary(p.getNetSalary())
                .paymentStatus(p.getPaymentStatus().getDisplayName())
                .paymentDate(p.getPaymentDate())
                .build();
    }
}
