package com.hrms.modulith.payroll;

import com.hrms.modulith.common.dto.ApiResponse;
import com.hrms.modulith.payroll.dto.GeneratePayrollRequest;
import com.hrms.modulith.payroll.dto.PayrollSummaryDto;
import com.hrms.modulith.payroll.dto.PayslipDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll & Compensation", description = "Endpoints for monthly salary generation, payslip distribution, and payroll analytics")
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/generate-monthly")
    @Operation(summary = "Generate and compute monthly payroll for all active employees")
    public ResponseEntity<ApiResponse<List<PayslipDto>>> generateMonthlyPayroll(@Valid @RequestBody GeneratePayrollRequest request) {
        List<PayslipDto> list = payrollService.generateMonthlyPayroll(request);
        return ResponseEntity.ok(ApiResponse.ok("Monthly payroll processed successfully", list));
    }

    @GetMapping("/payslips")
    @Operation(summary = "Get payslips list filtered by month or employee")
    public ResponseEntity<ApiResponse<List<PayslipDto>>> getPayslips(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String employeeId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getPayslips(month, employeeId)));
    }

    @GetMapping("/payslips/{id}")
    @Operation(summary = "Get detailed payslip breakdown by ID")
    public ResponseEntity<ApiResponse<PayslipDto>> getPayslipById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getPayslipById(id)));
    }

    @PatchMapping("/payslips/{id}/pay")
    @Operation(summary = "Mark payslip status as Paid")
    public ResponseEntity<ApiResponse<PayslipDto>> markAsPaid(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Payslip marked as paid", payrollService.markAsPaid(id)));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get monthly payroll executive summary")
    public ResponseEntity<ApiResponse<PayrollSummaryDto>> getPayrollSummary(@RequestParam(required = false) String month) {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getPayrollSummary(month)));
    }
}
