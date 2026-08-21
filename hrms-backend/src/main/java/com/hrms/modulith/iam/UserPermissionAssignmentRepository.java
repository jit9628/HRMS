package com.hrms.modulith.iam;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserPermissionAssignmentRepository extends JpaRepository<UserPermissionAssignment, String> {
    List<UserPermissionAssignment> findByUserId(String userId);
    void deleteByUserId(String userId);
}