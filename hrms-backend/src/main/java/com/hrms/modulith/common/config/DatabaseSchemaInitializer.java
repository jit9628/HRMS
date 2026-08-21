package com.hrms.modulith.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSchemaInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE user_accounts DROP CONSTRAINT IF EXISTS user_accounts_role_check");
            jdbcTemplate.execute("UPDATE user_accounts SET role = 'SUPER_ADMIN' WHERE role = 'Super Admin'");
            jdbcTemplate.execute("UPDATE user_accounts SET role = 'COMPANY_ADMIN' WHERE role = 'Company Admin'");
            jdbcTemplate.execute("UPDATE user_accounts SET role = 'HR_MANAGER' WHERE role = 'HR Manager'");
            jdbcTemplate.execute("UPDATE user_accounts SET role = 'EMPLOYEE' WHERE role = 'Employee'");
            jdbcTemplate.execute("UPDATE user_accounts SET role = 'ADMIN' WHERE role = 'Admin'");
            jdbcTemplate.execute("ALTER TABLE user_accounts ADD CONSTRAINT user_accounts_role_check "
                    + "CHECK (role IN ('SUPER_ADMIN', 'COMPANY_ADMIN', 'ADMIN', 'HR_MANAGER', 'EMPLOYEE'))");
            log.info("user_accounts role constraint synchronized");
        } catch (Exception exception) {
            log.warn("Could not synchronize user_accounts role constraint: {}", exception.getMessage());
        }
    }
}