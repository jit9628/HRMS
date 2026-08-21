package com.hrms.modulith.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static Optional<UserPrincipal> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    public static Optional<String> getCurrentUserId() {
        return getCurrentUser().map(UserPrincipal::getId);
    }

    public static Optional<String> getCurrentUserEmail() {
        return getCurrentUser().map(UserPrincipal::getEmail);
    }

    public static Optional<String> getCurrentUserRole() {
        return getCurrentUser().map(UserPrincipal::getRole);
    }

    public static Optional<String> getCurrentCompanyId() {
        return getCurrentUser().map(UserPrincipal::getCompanyId);
    }
}
