package com.hrms.modulith.iam;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserMenuAssignmentRepository extends JpaRepository<UserMenuAssignment, String> {

    List<UserMenuAssignment> findByUserId(String userId);

    List<UserMenuAssignment> findByUserIdAndEnabledTrue(String userId);

    List<UserMenuAssignment> findByUserIdAndEnabledFalse(String userId);

    Optional<UserMenuAssignment> findByUserIdAndFeatureCode(String userId, String featureCode);
}