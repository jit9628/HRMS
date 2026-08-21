package com.hrms.modulith.organization;

import com.hrms.modulith.common.dto.ApiResponse;
import com.hrms.modulith.organization.dto.CreateDepartmentRequest;
import com.hrms.modulith.organization.dto.DepartmentDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
@Tag(name = "Organization - Departments", description = "Endpoints for managing company departments with tenant isolation")
public class DepartmentController {

    private final OrganizationService organizationService;

    @GetMapping
    @Operation(summary = "Get departments (automatically filtered by logged-in company for COMPANY_ADMIN)")
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getDepartments(
            @RequestParam(required = false) String companyId
    ) {
        List<DepartmentDto> list = organizationService.getAllDepartments(companyId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    @Operation(summary = "Add department for logged-in company (restricted to COMPANY_ADMIN, HR_MANAGER, SUPER_ADMIN)")
    public ResponseEntity<ApiResponse<DepartmentDto>> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        DepartmentDto created = organizationService.createDepartment(request);
        return new ResponseEntity<>(ApiResponse.ok("Department created successfully", created), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete department by ID (restricted to department's owner company admin)")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable String id) {
        organizationService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.ok("Department deleted successfully", null));
    }
}
