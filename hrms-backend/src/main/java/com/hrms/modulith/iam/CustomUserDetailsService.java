package com.hrms.modulith.iam;

import com.hrms.modulith.common.security.UserPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userRepository;
    private final UserRoleAssignmentRepository userRoleAssignmentRepository;

    public CustomUserDetailsService(UserAccountRepository userRepository,
                                    UserRoleAssignmentRepository userRoleAssignmentRepository) {
        this.userRepository = userRepository;
        this.userRoleAssignmentRepository = userRoleAssignmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserAccount user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return UserPrincipal.create(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getName(),
                user.getRole().getDisplayName(),
                user.getCompanyId(),
                user.getCompanyName(),
                user.getDepartment(),
                user.getDesignation(),
                userRoleAssignmentRepository.findByUserId(user.getId()).stream()
                    .map(UserRoleAssignment::getRole)
                    .toList()
        );
    }
}
