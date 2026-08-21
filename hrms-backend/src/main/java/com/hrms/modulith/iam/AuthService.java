package com.hrms.modulith.iam;

import com.hrms.modulith.common.exception.BadRequestException;
import com.hrms.modulith.common.exception.ResourceNotFoundException;
import com.hrms.modulith.common.security.JwtTokenProvider;
import com.hrms.modulith.common.security.SecurityUtils;
import com.hrms.modulith.common.security.UserPrincipal;
import com.hrms.modulith.iam.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserRoleAssignmentRepository roleAssignmentRepository;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(userPrincipal);

        UserAccount user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        return LoginResponse.builder()
                .token(token)
            .user(mapToDto(user))
                .build();
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        Role requestedRole = request.getRole() != null ? Role.fromString(request.getRole()) : Role.EMPLOYEE;
        if (requestedRole == Role.COMPANY_ADMIN) {
            String currentRole = SecurityUtils.getCurrentUserRole().orElse("");
            if (!"Super Admin".equalsIgnoreCase(currentRole) && !"SUPER_ADMIN".equalsIgnoreCase(currentRole)) {
                throw new BadRequestException("Only Super Admin can create a Company Admin account");
            }
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address is already registered: " + request.getEmail());
        }

        String initials = "";
        String[] parts = request.getName().trim().split("\\s+");
        if (parts.length > 0 && !parts[0].isEmpty()) {
            initials += parts[0].charAt(0);
        }
        if (parts.length > 1 && !parts[1].isEmpty()) {
            initials += parts[1].charAt(0);
        }

        UserAccount user = UserAccount.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(requestedRole)
                .designation(request.getDesignation())
                .department(request.getDepartment())
                .companyId(request.getCompanyId() != null ? request.getCompanyId() : "COMP-001")
                .companyName(request.getCompanyName() != null ? request.getCompanyName() : "Acme Technologies")
                .avatarInitials(initials.toUpperCase())
                .active(true)
                .build();

        user = userRepository.save(user);
        return mapToDto(user);
    }

    @Transactional
    public UserDto registerCredentials(RegisterRequest request) {
        requireSuperAdminOrCompanyAdmin(request.getCompanyId());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address is already registered: " + request.getEmail());
        }
        String name = request.getName().trim();
        String[] parts = name.split("\\s+");
        String initials = parts.length > 1
                ? (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase()
                : parts[0].substring(0, 1).toUpperCase();

        UserAccount user = UserAccount.builder()
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(name)
                .role(Role.EMPLOYEE)
                .designation(request.getDesignation())
                .department(request.getDepartment())
                .companyId(request.getCompanyId())
                .companyName(request.getCompanyName())
                .avatarInitials(initials)
                .active(true)
                .build();
        return mapToDto(userRepository.save(user));
    }

    @Transactional
    public UserDto assignRoles(String userId, List<String> roleNames) {
        UserAccount target = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        requireRoleAssignmentAccess(target);
        if (roleNames == null || roleNames.isEmpty()) {
            throw new BadRequestException("At least one role is required");
        }
        UserAccount user = target;
        List<Role> roles = roleNames.stream().map(String::trim).map(this::parseRole).distinct().toList();
        if (roles.stream().anyMatch(role -> role == Role.SUPER_ADMIN || role == Role.ADMIN)
                && !isSuperAdmin()) {
            throw new BadRequestException("Company Admin cannot assign Super Admin or Admin roles");
        }
        if (roles.stream().anyMatch(role -> role == Role.EMPLOYEE) && roles.size() > 1) {
            throw new BadRequestException("Employee cannot be combined with another role");
        }
        user.setRole(roles.get(0));
        roleAssignmentRepository.deleteAll(roleAssignmentRepository.findByUserId(userId));
        roles.stream().skip(1).map(role -> UserRoleAssignment.builder().userId(userId).role(role).build())
                .forEach(roleAssignmentRepository::save);
        return mapToDto(userRepository.save(user));
    }

    private void requireSuperAdminOrCompanyAdmin(String companyId) {
        if (!isSuperAdmin()) {
            String role = SecurityUtils.getCurrentUserRole().orElse("");
            String currentCompanyId = SecurityUtils.getCurrentCompanyId().orElse(null);
            if (!"Company Admin".equalsIgnoreCase(role) && !"COMPANY_ADMIN".equalsIgnoreCase(role)) {
                throw new BadRequestException("Only Super Admin or Company Admin can create credentials");
            }
            if (currentCompanyId == null || !currentCompanyId.equals(companyId)) {
                throw new BadRequestException("Company Admin can create credentials only in their own company");
            }
        }
    }

    private void requireRoleAssignmentAccess(UserAccount target) {
        if (isSuperAdmin()) return;
        String role = SecurityUtils.getCurrentUserRole().orElse("");
        String currentCompanyId = SecurityUtils.getCurrentCompanyId().orElse(null);
        if (!"Company Admin".equalsIgnoreCase(role) && !"COMPANY_ADMIN".equalsIgnoreCase(role)) {
            throw new BadRequestException("Only Super Admin or Company Admin can assign roles");
        }
        if (currentCompanyId == null || !currentCompanyId.equals(target.getCompanyId())) {
            throw new BadRequestException("Company Admin can assign roles only in their own company");
        }
    }

    private boolean isSuperAdmin() {
        String role = SecurityUtils.getCurrentUserRole().orElse("");
        return "Super Admin".equalsIgnoreCase(role) || "SUPER_ADMIN".equalsIgnoreCase(role);
    }

    private Role parseRole(String roleName) {
        Role role = Role.fromString(roleName);
        if (role == Role.EMPLOYEE && !"Employee".equalsIgnoreCase(roleName)
                && !"EMPLOYEE".equalsIgnoreCase(roleName)) {
            throw new BadRequestException("Invalid role: " + roleName);
        }
        return role;
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new BadRequestException("No active authenticated session found"));

        UserAccount user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return mapToDto(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new BadRequestException("No active authenticated session found"));

        UserAccount user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public UserDto mapToDto(UserAccount user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().getDisplayName())
                .roles(getRoles(user).stream().map(Role::getDisplayName).toList())
                .designation(user.getDesignation())
                .department(user.getDepartment())
                .avatarInitials(user.getAvatarInitials())
                .companyId(user.getCompanyId())
                .companyName(user.getCompanyName())
                .employeeId(user.getEmployeeId())
                .build();
    }

    public List<Role> getRoles(UserAccount user) {
        return java.util.stream.Stream.concat(
                java.util.stream.Stream.of(user.getRole()),
                roleAssignmentRepository.findByUserId(user.getId()).stream().map(UserRoleAssignment::getRole))
                .distinct().toList();
    }
}
