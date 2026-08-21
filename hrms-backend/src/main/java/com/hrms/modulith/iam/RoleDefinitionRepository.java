package com.hrms.modulith.iam;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleDefinitionRepository extends JpaRepository<RoleDefinition, String> {
    Optional<RoleDefinition> findByCode(String code);
}