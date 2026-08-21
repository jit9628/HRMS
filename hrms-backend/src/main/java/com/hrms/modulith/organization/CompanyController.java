package com.hrms.modulith.organization;

import com.hrms.modulith.common.dto.ApiResponse;
import com.hrms.modulith.organization.dto.CompanyDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
@Tag(name = "Organization - Companies", description = "Endpoints for managing company profiles and subsidiaries")
public class CompanyController {

    private final OrganizationService organizationService;

    @GetMapping
    @Operation(summary = "Get list of all company profiles")
    public ResponseEntity<ApiResponse<List<CompanyDto>>> getAllCompanies() {
        return ResponseEntity.ok(ApiResponse.ok(organizationService.getAllCompanies()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get company details by ID")
    public ResponseEntity<ApiResponse<CompanyDto>> getCompanyById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(organizationService.getCompanyById(id)));
    }

    @PostMapping
    @Operation(summary = "Create or update company profile")
    public ResponseEntity<ApiResponse<CompanyDto>> createCompany(@RequestBody CompanyProfile company) {
        return ResponseEntity.ok(ApiResponse.ok("Company saved", organizationService.saveCompany(company)));
    }
}
