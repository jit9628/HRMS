package com.hrms.modulith.iam;

import com.hrms.modulith.common.exception.BadRequestException;
import com.hrms.modulith.common.exception.ResourceNotFoundException;
import com.hrms.modulith.common.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuAssignmentService {

    private final UserAccountRepository userRepository;
    private final UserMenuAssignmentRepository assignmentRepository;

    @Transactional(readOnly = true)
    public List<String> getAssignments(String userId) {
        requireAssignmentAccess(requireUser(userId));
        return assignmentRepository.findByUserIdAndEnabledTrue(userId).stream()
                .map(UserMenuAssignment::getFeatureCode)
                .toList();
    }

    @Transactional
    public List<String> assign(String userId, String featureCode) {
        requireAssignmentAccess(requireUser(userId));
        String normalizedCode = normalizeFeatureCode(featureCode);
        UserMenuAssignment assignment = assignmentRepository.findByUserIdAndFeatureCode(userId, normalizedCode)
            .orElseGet(() -> UserMenuAssignment.builder()
                .userId(userId)
                .featureCode(normalizedCode)
                .build());
        assignment.setEnabled(true);
        assignmentRepository.save(assignment);
        return getAssignmentsWithoutAuthorization(userId);
    }

    @Transactional
    public List<String> remove(String userId, String featureCode) {
        requireAssignmentAccess(requireUser(userId));
        String normalizedCode = normalizeFeatureCode(featureCode);
        UserMenuAssignment assignment = assignmentRepository.findByUserIdAndFeatureCode(userId, normalizedCode)
            .orElseGet(() -> UserMenuAssignment.builder()
                .userId(userId)
                .featureCode(normalizedCode)
                .build());
        assignment.setEnabled(false);
        assignmentRepository.save(assignment);
        return getAssignmentsWithoutAuthorization(userId);
    }

    private List<String> getAssignmentsWithoutAuthorization(String userId) {
        return assignmentRepository.findByUserIdAndEnabledTrue(userId).stream()
                .map(UserMenuAssignment::getFeatureCode)
                .toList();
    }

    private UserAccount requireUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserAccount", "id", userId));
    }

    public void requireAssignmentAccess(UserAccount target) {
        String role = SecurityUtils.getCurrentUserRole().orElse("");
        if ("Super Admin".equalsIgnoreCase(role) || "SUPER_ADMIN".equalsIgnoreCase(role)) return;
        String companyId = SecurityUtils.getCurrentCompanyId().orElse(null);
        if (!"Company Admin".equalsIgnoreCase(role) && !"COMPANY_ADMIN".equalsIgnoreCase(role)) {
            throw new BadRequestException("Only Super Admin or Company Admin can assign or remove menus");
        }
        if (companyId == null || !companyId.equals(target.getCompanyId())) {
            throw new BadRequestException("Company Admin can manage menus only in their own company");
        }
    }

    private String normalizeFeatureCode(String featureCode) {
        if (featureCode == null || featureCode.isBlank()) {
            throw new BadRequestException("Feature code is required");
        }
        return featureCode.trim().toUpperCase();
    }
}