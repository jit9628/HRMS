package com.hrms.modulith.iam;

import com.hrms.modulith.common.exception.ResourceNotFoundException;
import com.hrms.modulith.common.security.SecurityUtils;
import com.hrms.modulith.iam.dto.UserDto;
import com.hrms.modulith.iam.dto.UserFeatureDto;
import com.hrms.modulith.iam.dto.UserFeaturesResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuService {

    private final UserAccountRepository userRepository;
        private final UserMenuAssignmentRepository assignmentRepository;
        private final UserRoleAssignmentRepository roleAssignmentRepository;
        private final UserPermissionAssignmentRepository permissionAssignmentRepository;

    @Transactional(readOnly = true)
    public UserFeaturesResponse getFeaturesByUserId(String userId) {
        UserAccount user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserAccount", "id", userId));

        return buildUserFeaturesResponse(user);
    }

    @Transactional(readOnly = true)
    public UserFeaturesResponse getCurrentUserFeatures() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new ResourceNotFoundException("UserAccount", "session", "No active authenticated session"));

        UserAccount user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("UserAccount", "email", email));

        return buildUserFeaturesResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole().getDisplayName())
                        .designation(u.getDesignation())
                        .department(u.getDepartment())
                        .avatarInitials(u.getAvatarInitials())
                        .companyId(u.getCompanyId())
                        .companyName(u.getCompanyName())
                        .employeeId(u.getEmployeeId())
                        .build())
                .collect(Collectors.toList());
    }

    public UserFeaturesResponse buildUserFeaturesResponse(UserAccount user) {
        Role role = user.getRole();
        Set<Role> roles = new java.util.HashSet<>();
        roles.add(role);
        roleAssignmentRepository.findByUserId(user.getId()).stream()
                .map(UserRoleAssignment::getRole)
                .forEach(roles::add);
        List<UserFeatureDto> features = new ArrayList<>();

        // 1. Dashboard (All users)
        features.add(UserFeatureDto.builder()
                .id("feat-dashboard")
                .code("DASHBOARD")
                .title("Dashboard")
                .path("/dashboard")
                .icon("dashboard")
                .category("CORE WORKSPACE")
                .orderIndex(1)
                .enabled(true)
                .permissions(List.of("READ"))
                .build());

        // 2. Employees / Directory (All users)
        features.add(UserFeatureDto.builder()
                .id("feat-employees")
                .code("EMPLOYEES")
                .title(role == Role.EMPLOYEE ? "Directory" : "Employees")
                .path("/employees")
                .icon("users")
                .category("CORE WORKSPACE")
                .orderIndex(2)
                .enabled(true)
                .permissions(role == Role.EMPLOYEE ? List.of("READ") : List.of("READ", "WRITE", "DELETE", "EXPORT"))
                .build());

        // 3. Attendance (All users)
        features.add(UserFeatureDto.builder()
                .id("feat-attendance")
                .code("ATTENDANCE")
                .title("Attendance")
                .path("/attendance")
                .icon("clock")
                .category("CORE WORKSPACE")
                .orderIndex(3)
                .enabled(true)
                .permissions(role == Role.EMPLOYEE ? List.of("PUNCH", "READ") : List.of("READ", "WRITE", "APPROVE", "EXPORT"))
                .build());

        // 4. Leave Management (All users)
        features.add(UserFeatureDto.builder()
                .id("feat-leaves")
                .code("LEAVES")
                .title("Leave Management")
                .path("/leaves")
                .icon("calendar")
                .category("CORE WORKSPACE")
                .orderIndex(4)
                .badge(role == Role.EMPLOYEE ? null : 2)
                .enabled(true)
                .permissions(role == Role.EMPLOYEE ? List.of("APPLY", "READ") : List.of("READ", "APPLY", "APPROVE", "REJECT"))
                .build());

        // 5. Payroll & Payslips (All users)
        features.add(UserFeatureDto.builder()
                .id("feat-payroll")
                .code("PAYROLL")
                .title("Payroll & Payslips")
                .path("/payroll")
                .icon("dollar-sign")
                .category("CORE WORKSPACE")
                .orderIndex(5)
                .enabled(true)
                .permissions(role == Role.EMPLOYEE ? List.of("READ_OWN") : List.of("READ", "GENERATE", "APPROVE", "DISBURSE"))
                .build());

        // 6. Recruitment ATS (Super Admin, Company Admin, HR Manager)
        if (roles.stream().anyMatch(candidate -> candidate == Role.SUPER_ADMIN || candidate == Role.COMPANY_ADMIN || candidate == Role.HR_MANAGER || candidate == Role.ADMIN)) {
            features.add(UserFeatureDto.builder()
                    .id("feat-recruitment")
                    .code("RECRUITMENT")
                    .title("Recruitment (ATS)")
                    .path("/recruitment")
                    .icon("briefcase")
                    .category("TALENT ACQUISITION")
                    .orderIndex(6)
                    .badge(3)
                    .enabled(true)
                    .permissions(List.of("READ", "POST_JOB", "HIRE_CANDIDATE"))
                    .build());
        }

        // 7. Performance & OKRs (All users)
        features.add(UserFeatureDto.builder()
                .id("feat-performance")
                .code("PERFORMANCE")
                .title("Performance & OKRs")
                .path("/performance")
                .icon("award")
                .category("GROWTH & GOALS")
                .orderIndex(7)
                .enabled(true)
                .permissions(role == Role.EMPLOYEE ? List.of("READ_OWN", "UPDATE_PROGRESS") : List.of("READ", "CREATE_GOAL", "APPRAISAL_REVIEW"))
                .build());

        // 8. Companies & Entities (Super Admin exclusive)
        if (roles.contains(Role.SUPER_ADMIN)) {
            features.add(UserFeatureDto.builder()
                    .id("feat-companies")
                    .code("COMPANIES")
                    .title("Companies & Entities")
                    .path("/companies")
                    .icon("building")
                    .category("ENTERPRISE GOVERNANCE")
                    .orderIndex(8)
                    .enabled(true)
                    .permissions(List.of("READ", "WRITE", "DELETE", "MANAGE_DEPARTMENTS"))
                    .build());
        }

        // 9. Organization Settings (Admins only)
        if (roles.stream().anyMatch(candidate -> candidate == Role.SUPER_ADMIN || candidate == Role.COMPANY_ADMIN || candidate == Role.ADMIN)) {
            features.add(UserFeatureDto.builder()
                    .id("feat-settings")
                    .code("SETTINGS")
                    .title("Organization Settings")
                    .path("/settings")
                    .icon("settings")
                    .category("ADMINISTRATION")
                    .orderIndex(9)
                    .enabled(true)
                    .permissions(List.of("READ", "CONFIG_POLICIES", "UPDATE_COMPANY"))
                    .build());
        }

        if (roles.contains(Role.SUPER_ADMIN)) {
            features.add(UserFeatureDto.builder()
                    .id("feat-access-control")
                    .code("ACCESS_CONTROL")
                    .title("Access Control")
                    .path("/access-control")
                    .icon("shield")
                    .category("SECURITY")
                    .orderIndex(10)
                    .enabled(true)
                    .permissions(List.of("READ", "ASSIGN_ROLE", "ASSIGN_PERMISSION", "ASSIGN_MENU", "ASSIGN_SUBMENU"))
                    .build());
        }

        Set<String> disabledFeatures = assignmentRepository.findByUserIdAndEnabledFalse(user.getId()).stream()
                .map(UserMenuAssignment::getFeatureCode)
                .collect(Collectors.toSet());
        Set<String> assignedPermissions = permissionAssignmentRepository.findByUserId(user.getId()).stream()
                .map(permission -> permission.getFeatureCode() + ":" + permission.getPermissionCode())
                .collect(Collectors.toSet());
        Set<String> assignedFeatures = assignmentRepository.findByUserIdAndEnabledTrue(user.getId()).stream()
                .map(UserMenuAssignment::getFeatureCode)
                .collect(Collectors.toSet());
        for (UserFeatureDto feature : features) {
            List<UserFeatureDto> children = assignedFeatures.stream()
                    .filter(code -> code.startsWith(feature.getCode() + "."))
                    .map(code -> UserFeatureDto.builder()
                            .id("sub-" + code.toLowerCase())
                            .code(code)
                            .title(submenuTitle(code))
                            .path(feature.getPath() + "/" + code.substring(feature.getCode().length() + 1).toLowerCase())
                            .icon(feature.getIcon())
                            .category(feature.getCategory())
                            .orderIndex(feature.getOrderIndex())
                            .enabled(true)
                            .permissions(List.of("READ"))
                            .build())
                    .toList();
            feature.setChildren(children);
        }
        features.removeIf(feature -> !assignedFeatures.contains(feature.getCode())
                && (feature.getChildren() == null || feature.getChildren().isEmpty()));
        features.removeIf(feature -> disabledFeatures.contains(feature.getCode()));
        features.forEach(feature -> {
            List<String> permissions = assignedPermissions.stream()
                    .filter(value -> value.startsWith(feature.getCode() + ":") || value.startsWith("ALL:"))
                    .map(value -> value.substring(value.indexOf(':') + 1))
                    .toList();
            if (!permissions.isEmpty()) feature.setPermissions(permissions);
        });

        return UserFeaturesResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().getDisplayName())
                .designation(user.getDesignation())
                .department(user.getDepartment())
                .companyId(user.getCompanyId())
                .companyName(user.getCompanyName())
                .features(features)
                .build();
    }

        private String submenuTitle(String code) {
                String value = code.substring(code.indexOf('.') + 1).replace('_', ' ').toLowerCase();
                return java.util.Arrays.stream(value.split(" "))
                                .map(word -> word.isEmpty() ? word : Character.toUpperCase(word.charAt(0)) + word.substring(1))
                                .collect(Collectors.joining(" "));
        }
}
