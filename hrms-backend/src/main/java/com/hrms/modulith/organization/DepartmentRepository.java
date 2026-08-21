package com.hrms.modulith.organization;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, String> {

    List<Department> findByCompanyId(String companyId);

    Optional<Department> findByName(String name);

    Optional<Department> findByCode(String code);
}
