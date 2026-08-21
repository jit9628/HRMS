package com.hrms.modulith.iam;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRoleAssignmentRepository extends JpaRepository<UserRoleAssignment, String> {
    List<UserRoleAssignment> findByUserId(String userId);
    Optional<UserRoleAssignment> findByUserIdAndRole(String userId, Role role);
}