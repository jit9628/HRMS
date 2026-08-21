package com.hrms.modulith.organization;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, String> {

    List<Designation> findByDepartment(String department);

    List<Designation> findByCompanyId(String companyId);
}
