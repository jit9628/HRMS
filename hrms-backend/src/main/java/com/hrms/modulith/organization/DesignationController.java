package com.hrms.modulith.organization;

import com.hrms.modulith.common.dto.ApiResponse;
import com.hrms.modulith.organization.dto.DesignationDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/designations")
@RequiredArgsConstructor
@Tag(name = "Organization - Designations", description = "Endpoints for managing job designations and roles")
public class DesignationController {

    private final OrganizationService organizationService;

    @GetMapping
    @Operation(summary = "Get all designations")
    public ResponseEntity<ApiResponse<List<DesignationDto>>> getAllDesignations() {
        return ResponseEntity.ok(ApiResponse.ok(organizationService.getAllDesignations()));
    }

    @PostMapping
    @Operation(summary = "Create or update designation")
    public ResponseEntity<ApiResponse<DesignationDto>> saveDesignation(@RequestBody Designation designation) {
        return ResponseEntity.ok(ApiResponse.ok("Designation saved", organizationService.saveDesignation(designation)));
    }
}
