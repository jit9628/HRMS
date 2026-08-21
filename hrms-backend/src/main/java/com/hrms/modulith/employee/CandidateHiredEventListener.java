package com.hrms.modulith.employee;

import com.hrms.modulith.recruitment.CandidateHiredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CandidateHiredEventListener {

    private final EmployeeService employeeService;

    @ApplicationModuleListener
    public void onCandidateHired(CandidateHiredEvent event) {
        log.info("Employee module received CandidateHiredEvent for candidate: {} (Job: {})",
                event.candidateName(), event.jobTitle());

        String[] parts = event.candidateName().trim().split("\\s+", 2);
        String first = parts.length > 0 ? parts[0] : "New";
        String last = parts.length > 1 ? parts[1] : "Employee";
        String code = "EMP-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        CreateEmployeeRequest req = new CreateEmployeeRequest();
        req.setEmployeeCode(code);
        req.setFirstName(first);
        req.setLastName(last);
        req.setEmail(event.email());
        req.setPhone(event.phone());
        req.setDepartment(event.department());
        req.setDesignation(event.jobTitle());
        req.setJoinDate(event.joinDate());
        req.setSalary(event.salaryOffered());
        req.setStatus("Probation");
        req.setEmploymentType("Full-Time");

        try {
            employeeService.createEmployee(req);
            log.info("Auto-onboarded hired candidate as employee: {}", code);
        } catch (Exception ex) {
            log.warn("Could not auto-create employee for hired candidate {}: {}", event.email(), ex.getMessage());
        }
    }
}
