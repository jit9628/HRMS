package com.hrms.modulith.employee;

import com.hrms.modulith.common.dto.ApiResponse;
import com.hrms.modulith.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Endpoints for employee lifecycle, directory, profile, and analytics")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @Operation(summary = "Get paginated list of employees with search and filters")
    public ResponseEntity<ApiResponse<PageResponse<EmployeeDto>>> getEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<EmployeeDto> result = employeeService.getEmployees(search, department, status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all employees unpaginated for selectors and dropdowns")
    public ResponseEntity<ApiResponse<List<EmployeeDto>>> getAllEmployees() {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getAllEmployeesList()));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get employee headcount statistics and department distribution")
    public ResponseEntity<ApiResponse<EmployeeStatsDto>> getEmployeeStats() {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getStats()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee profile by ID")
    public ResponseEntity<ApiResponse<EmployeeDto>> getEmployeeById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getEmployeeById(id)));
    }

    @PostMapping
    @Operation(summary = "Onboard a new employee")
    public ResponseEntity<ApiResponse<EmployeeDto>> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeDto result = employeeService.createEmployee(request);
        return new ResponseEntity<>(ApiResponse.ok("Employee onboarded successfully", result), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee details")
    public ResponseEntity<ApiResponse<EmployeeDto>> updateEmployee(@PathVariable String id, @RequestBody UpdateEmployeeRequest request) {
        EmployeeDto result = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Employee updated successfully", result));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update employee employment status")
    public ResponseEntity<ApiResponse<EmployeeDto>> updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        EmployeeDto result = employeeService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Employee status updated", result));
    }
}
