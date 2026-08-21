package com.hrms.modulith.employee;

import com.hrms.modulith.common.dto.PageResponse;
import com.hrms.modulith.common.exception.BadRequestException;
import com.hrms.modulith.common.exception.ResourceNotFoundException;
import com.hrms.modulith.common.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public PageResponse<EmployeeDto> getEmployees(String search, String department, String status, Pageable pageable) {
        Specification<Employee> spec = (root, query, cb) -> {
            var predicates = cb.conjunction();
            if (StringUtils.hasText(search)) {
                String likeTerm = "%" + search.toLowerCase() + "%";
                predicates = cb.and(predicates, cb.or(
                        cb.like(cb.lower(root.get("firstName")), likeTerm),
                        cb.like(cb.lower(root.get("lastName")), likeTerm),
                        cb.like(cb.lower(root.get("email")), likeTerm),
                        cb.like(cb.lower(root.get("employeeCode")), likeTerm),
                        cb.like(cb.lower(root.get("designation")), likeTerm)
                ));
            }
            if (StringUtils.hasText(department)) {
                predicates = cb.and(predicates, cb.equal(root.get("department"), department));
            }
            if (StringUtils.hasText(status)) {
                predicates = cb.and(predicates, cb.equal(root.get("status"), EmployeeStatus.fromString(status)));
            }
            return predicates;
        };

        Page<Employee> page = employeeRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(this::mapToDto));
    }

    @Transactional(readOnly = true)
    public List<EmployeeDto> getAllEmployeesList() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeById(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return mapToDto(employee);
    }

    @Transactional
    public EmployeeDto createEmployee(CreateEmployeeRequest req) {
        String currentRole = SecurityUtils.getCurrentUserRole().orElse("");
        String currentCompanyId = SecurityUtils.getCurrentCompanyId().orElse(null);
        boolean isSuperAdmin = "Super Admin".equalsIgnoreCase(currentRole) || "SUPER_ADMIN".equalsIgnoreCase(currentRole);
        boolean isCompanyAdmin = "Company Admin".equalsIgnoreCase(currentRole) || "COMPANY_ADMIN".equalsIgnoreCase(currentRole);
        if (!isSuperAdmin && !isCompanyAdmin) {
            throw new BadRequestException("Only Super Admin or Company Admin can create employees");
        }
        if (!isSuperAdmin && (currentCompanyId == null || !currentCompanyId.equals(req.getCompanyId()))) {
            throw new BadRequestException("Company Admin can create employees only in their own company");
        }
        if (employeeRepository.findByEmployeeCode(req.getEmployeeCode()).isPresent()) {
            throw new BadRequestException("Employee code already exists: " + req.getEmployeeCode());
        }
        if (employeeRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new BadRequestException("Email already in use: " + req.getEmail());
        }

        Employee employee = Employee.builder()
                .companyId(req.getCompanyId() != null ? req.getCompanyId() : "COMP-001")
                .companyName(req.getCompanyName() != null ? req.getCompanyName() : "Acme Technologies")
                .employeeCode(req.getEmployeeCode())
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .avatarUrl(req.getAvatarUrl())
                .department(req.getDepartment())
                .designation(req.getDesignation())
                .joinDate(req.getJoinDate())
                .employmentType(req.getEmploymentType() != null ? EmploymentType.fromString(req.getEmploymentType()) : EmploymentType.FULL_TIME)
                .status(req.getStatus() != null ? EmployeeStatus.fromString(req.getStatus()) : EmployeeStatus.ACTIVE)
                .salary(req.getSalary() != null ? req.getSalary() : BigDecimal.ZERO)
                .managerName(req.getManagerName())
                .location(req.getLocation() != null ? req.getLocation() : "HQ - New York")
                .address(req.getAddress())
                .emergencyContact(req.getEmergencyContact())
                .bankDetails(req.getBankDetails())
                .build();

        employee = employeeRepository.save(employee);

        // Publish Spring Modulith Domain Event!
        eventPublisher.publishEvent(new EmployeeOnboardedEvent(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getCompanyId(),
                employee.getSalary(),
                employee.getJoinDate()
        ));

        log.info("Onboarded employee {} - published EmployeeOnboardedEvent", employee.getEmployeeCode());
        return mapToDto(employee);
    }

    @Transactional
    public EmployeeDto updateEmployee(String id, UpdateEmployeeRequest req) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        if (req.getFirstName() != null) employee.setFirstName(req.getFirstName());
        if (req.getLastName() != null) employee.setLastName(req.getLastName());
        if (req.getPhone() != null) employee.setPhone(req.getPhone());
        if (req.getAvatarUrl() != null) employee.setAvatarUrl(req.getAvatarUrl());
        if (req.getDepartment() != null) employee.setDepartment(req.getDepartment());
        if (req.getDesignation() != null) employee.setDesignation(req.getDesignation());
        if (req.getEmploymentType() != null) employee.setEmploymentType(EmploymentType.fromString(req.getEmploymentType()));
        if (req.getManagerName() != null) employee.setManagerName(req.getManagerName());
        if (req.getLocation() != null) employee.setLocation(req.getLocation());
        if (req.getAddress() != null) employee.setAddress(req.getAddress());
        if (req.getEmergencyContact() != null) employee.setEmergencyContact(req.getEmergencyContact());
        if (req.getBankDetails() != null) employee.setBankDetails(req.getBankDetails());

        if (req.getSalary() != null && !req.getSalary().equals(employee.getSalary())) {
            BigDecimal oldSalary = employee.getSalary();
            employee.setSalary(req.getSalary());
            eventPublisher.publishEvent(new EmployeeSalaryUpdatedEvent(employee.getId(), oldSalary, req.getSalary()));
        }

        if (req.getStatus() != null) {
            EmployeeStatus newStatus = EmployeeStatus.fromString(req.getStatus());
            if (newStatus != employee.getStatus()) {
                EmployeeStatus oldStatus = employee.getStatus();
                employee.setStatus(newStatus);
                eventPublisher.publishEvent(new EmployeeStatusChangedEvent(employee.getId(), oldStatus, newStatus));
            }
        }

        employee = employeeRepository.save(employee);
        return mapToDto(employee);
    }

    @Transactional
    public EmployeeDto updateStatus(String id, String statusStr) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        EmployeeStatus newStatus = EmployeeStatus.fromString(statusStr);
        EmployeeStatus oldStatus = employee.getStatus();
        employee.setStatus(newStatus);
        employee = employeeRepository.save(employee);

        eventPublisher.publishEvent(new EmployeeStatusChangedEvent(employee.getId(), oldStatus, newStatus));
        return mapToDto(employee);
    }

    @Transactional(readOnly = true)
    public EmployeeStatsDto getStats() {
        long total = employeeRepository.count();
        long active = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long onLeave = employeeRepository.countByStatus(EmployeeStatus.ON_LEAVE);
        long probation = employeeRepository.countByStatus(EmployeeStatus.PROBATION);
        long terminated = employeeRepository.countByStatus(EmployeeStatus.TERMINATED);

        Map<String, Long> deptMap = new HashMap<>();
        List<Object[]> deptCounts = employeeRepository.countByDepartment();
        for (Object[] row : deptCounts) {
            deptMap.put((String) row[0], (Long) row[1]);
        }

        return EmployeeStatsDto.builder()
                .totalEmployees(total)
                .activeEmployees(active)
                .onLeaveEmployees(onLeave)
                .probationEmployees(probation)
                .terminatedEmployees(terminated)
                .departmentDistribution(deptMap)
                .build();
    }

    public EmployeeDto mapToDto(Employee e) {
        return EmployeeDto.builder()
                .id(e.getId())
                .companyId(e.getCompanyId())
                .companyName(e.getCompanyName())
                .employeeCode(e.getEmployeeCode())
                .firstName(e.getFirstName())
                .lastName(e.getLastName())
                .email(e.getEmail())
                .phone(e.getPhone())
                .avatarUrl(e.getAvatarUrl())
                .department(e.getDepartment())
                .designation(e.getDesignation())
                .joinDate(e.getJoinDate())
                .employmentType(e.getEmploymentType().getDisplayName())
                .status(e.getStatus().getDisplayName())
                .salary(e.getSalary())
                .managerName(e.getManagerName())
                .location(e.getLocation())
                .address(e.getAddress())
                .emergencyContact(e.getEmergencyContact())
                .bankDetails(e.getBankDetails())
                .build();
    }
}
