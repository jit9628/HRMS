package com.hrms.modulith.iam;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, String> {

    Optional<UserAccount> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<UserAccount> findByEmployeeId(String employeeId);
}
