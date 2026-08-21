package com.hrms.modulith.iam;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PermissionDefinitionRepository extends JpaRepository<PermissionDefinition, String> {
    Optional<PermissionDefinition> findByCode(String code);
}