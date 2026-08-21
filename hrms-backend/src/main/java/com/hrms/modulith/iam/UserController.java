package com.hrms.modulith.iam;

import com.hrms.modulith.common.dto.ApiResponse;
import com.hrms.modulith.iam.dto.UserDto;
import com.hrms.modulith.iam.dto.MenuAssignmentRequest;
import com.hrms.modulith.iam.dto.RoleAssignmentRequest;
import com.hrms.modulith.iam.dto.UserFeaturesResponse;
import com.hrms.modulith.iam.dto.PermissionAssignmentRequest;
import com.hrms.modulith.iam.dto.DefinitionRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users & Dynamic Menu Permissions", description = "Endpoints for user management and dynamic feature menus")
public class UserController {

    private final MenuService menuService;
    private final MenuAssignmentService menuAssignmentService;
    private final AuthService authService;
    private final UserPermissionAssignmentRepository permissionRepository;
    private final UserAccountRepository userRepository;
    private final RoleDefinitionRepository roleDefinitionRepository;
    private final PermissionDefinitionRepository permissionDefinitionRepository;

    @GetMapping("/{userId}/features")
    @Operation(summary = "Get dynamic menu features for a specific user ID")
    public ResponseEntity<ApiResponse<UserFeaturesResponse>> getUserFeatures(@PathVariable String userId) {
        UserFeaturesResponse response = menuService.getFeaturesByUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok("User features retrieved successfully", response));
    }

    @GetMapping("/me/features")
    @Operation(summary = "Get dynamic menu features for currently authenticated user")
    public ResponseEntity<ApiResponse<UserFeaturesResponse>> getCurrentUserFeatures() {
        UserFeaturesResponse response = menuService.getCurrentUserFeatures();
        return ResponseEntity.ok(ApiResponse.ok("Current user features retrieved successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all users list")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(menuService.getAllUsers()));
    }

    @PutMapping("/{userId}/role")
    @Operation(summary = "Assign a role to a user")
    public ResponseEntity<ApiResponse<UserDto>> assignRole(
            @PathVariable String userId,
            @Valid @RequestBody RoleAssignmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Role assigned successfully",
                authService.assignRoles(userId, request.effectiveRoles())));
    }

    @GetMapping("/{userId}/menu-assignments")
    @Operation(summary = "Get menu assignments for a user")
    public ResponseEntity<ApiResponse<List<String>>> getMenuAssignments(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.ok(menuAssignmentService.getAssignments(userId)));
    }

    @PostMapping("/{userId}/menu-assignments")
    @Operation(summary = "Assign a menu to a user")
    public ResponseEntity<ApiResponse<List<String>>> assignMenu(
            @PathVariable String userId,
            @Valid @RequestBody MenuAssignmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Menu assigned successfully",
                menuAssignmentService.assign(userId, request.getFeatureCode())));
    }

    @DeleteMapping("/{userId}/menu-assignments/{featureCode}")
    @Operation(summary = "Remove a menu from a user")
    public ResponseEntity<ApiResponse<List<String>>> removeMenu(
            @PathVariable String userId,
            @PathVariable String featureCode) {
        return ResponseEntity.ok(ApiResponse.ok("Menu removed successfully",
                menuAssignmentService.remove(userId, featureCode)));
    }

    @GetMapping("/{userId}/permission-assignments")
    @Operation(summary = "Get assigned permissions for a user")
    public ResponseEntity<ApiResponse<List<UserPermissionAssignment>>> getPermissions(@PathVariable String userId) {
        menuAssignmentService.requireAssignmentAccess(userRepository.findById(userId)
            .orElseThrow(() -> new com.hrms.modulith.common.exception.ResourceNotFoundException("UserAccount", "id", userId)));
        return ResponseEntity.ok(ApiResponse.ok(permissionRepository.findByUserId(userId)));
    }

    @PostMapping("/{userId}/permission-assignments")
    @Operation(summary = "Assign a permission to a user")
    public ResponseEntity<ApiResponse<UserPermissionAssignment>> assignPermission(
            @PathVariable String userId,
            @Valid @RequestBody PermissionAssignmentRequest request) {
            menuAssignmentService.requireAssignmentAccess(userRepository.findById(userId)
                .orElseThrow(() -> new com.hrms.modulith.common.exception.ResourceNotFoundException("UserAccount", "id", userId)));
        UserPermissionAssignment assignment = permissionRepository.save(UserPermissionAssignment.builder()
                .userId(userId)
                .featureCode(request.getFeatureCode().trim().toUpperCase())
                .permissionCode(request.getPermissionCode().trim().toUpperCase())
                .build());
        return ResponseEntity.ok(ApiResponse.ok("Permission assigned successfully", assignment));
    }

    @DeleteMapping("/{userId}/permission-assignments")
    @Operation(summary = "Remove all assigned permissions from a user")
    public ResponseEntity<ApiResponse<Void>> removePermissions(@PathVariable String userId) {
        menuAssignmentService.requireAssignmentAccess(userRepository.findById(userId)
            .orElseThrow(() -> new com.hrms.modulith.common.exception.ResourceNotFoundException("UserAccount", "id", userId)));
        permissionRepository.deleteByUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok("Permissions removed successfully", null));
    }

    @GetMapping("/access-control/roles")
    public ResponseEntity<ApiResponse<List<RoleDefinition>>> getRoles() {
        return ResponseEntity.ok(ApiResponse.ok(roleDefinitionRepository.findAll()));
    }

    @PostMapping("/access-control/roles")
    public ResponseEntity<ApiResponse<RoleDefinition>> createRole(@Valid @RequestBody DefinitionRequest request) {
        requireSuperAdmin();
        RoleDefinition role = roleDefinitionRepository.save(RoleDefinition.builder()
                .code(request.getCode().trim().toUpperCase()).name(request.getName().trim()).description(request.getDescription()).build());
        return ResponseEntity.ok(ApiResponse.ok("Role created successfully", role));
    }

    @GetMapping("/access-control/permissions")
    public ResponseEntity<ApiResponse<List<PermissionDefinition>>> getPermissionDefinitions() {
        return ResponseEntity.ok(ApiResponse.ok(permissionDefinitionRepository.findAll()));
    }

    @PostMapping("/access-control/permissions")
    public ResponseEntity<ApiResponse<PermissionDefinition>> createPermission(@Valid @RequestBody DefinitionRequest request) {
        requireSuperAdmin();
        PermissionDefinition permission = permissionDefinitionRepository.save(PermissionDefinition.builder()
                .code(request.getCode().trim().toUpperCase()).name(request.getName().trim()).description(request.getDescription()).build());
        return ResponseEntity.ok(ApiResponse.ok("Permission created successfully", permission));
    }

    private void requireSuperAdmin() {
        String role = com.hrms.modulith.common.security.SecurityUtils.getCurrentUserRole().orElse("");
        if (!"Super Admin".equalsIgnoreCase(role) && !"SUPER_ADMIN".equalsIgnoreCase(role)) {
            throw new com.hrms.modulith.common.exception.BadRequestException("Only Super Admin can create roles and permissions");
        }
    }
}
