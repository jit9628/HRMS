package com.hrms.modulith.organization;

import com.hrms.modulith.common.exception.BadRequestException;
import com.hrms.modulith.common.exception.ResourceNotFoundException;
import com.hrms.modulith.common.security.SecurityUtils;
import com.hrms.modulith.common.security.UserPrincipal;
import com.hrms.modulith.organization.dto.CompanyDto;
import com.hrms.modulith.organization.dto.CreateDepartmentRequest;
import com.hrms.modulith.organization.dto.DepartmentDto;
import com.hrms.modulith.organization.dto.DesignationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final CompanyProfileRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;

    // Companies
    @Transactional(readOnly = true)
    public List<CompanyDto> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::mapCompanyToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyDto getCompanyById(String id) {
        CompanyProfile company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        return mapCompanyToDto(company);
    }

    @Transactional
    public CompanyDto saveCompany(CompanyProfile company) {
        String role = SecurityUtils.getCurrentUserRole().orElse("");
        if (!"Super Admin".equalsIgnoreCase(role) && !"SUPER_ADMIN".equalsIgnoreCase(role)) {
            throw new BadRequestException("Only Super Admin can register or update companies");
        }
        return mapCompanyToDto(companyRepository.save(company));
    }

    // Departments
    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments(String queryCompanyId) {
        Optional<UserPrincipal> userOpt = SecurityUtils.getCurrentUser();

        if (userOpt.isPresent()) {
            UserPrincipal currentUser = userOpt.get();
            String userRole = currentUser.getRole();
            String userCompanyId = currentUser.getCompanyId();

            boolean isSuperAdmin = "Super Admin".equalsIgnoreCase(userRole) || "SUPER_ADMIN".equalsIgnoreCase(userRole);

            // If non-super admin (e.g. COMPANY_ADMIN, HR_MANAGER, EMPLOYEE), restrict strictly to their own company
            if (!isSuperAdmin && userCompanyId != null && !userCompanyId.isBlank()) {
                return departmentRepository.findByCompanyId(userCompanyId).stream()
                        .map(this::mapDepartmentToDto)
                        .collect(Collectors.toList());
            }
        }

        if (queryCompanyId != null && !queryCompanyId.isBlank() && !"ALL".equalsIgnoreCase(queryCompanyId)) {
            return departmentRepository.findByCompanyId(queryCompanyId).stream()
                    .map(this::mapDepartmentToDto)
                    .collect(Collectors.toList());
        }

        return departmentRepository.findAll().stream()
                .map(this::mapDepartmentToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DepartmentDto createDepartment(CreateDepartmentRequest request) {
        UserPrincipal currentUser = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new BadRequestException("User authentication required"));

        String userRole = currentUser.getRole();
        String userCompanyId = currentUser.getCompanyId();

        boolean isSuperAdmin = "Super Admin".equalsIgnoreCase(userRole) || "SUPER_ADMIN".equalsIgnoreCase(userRole);
        boolean isCompanyAdmin = "Company Admin".equalsIgnoreCase(userRole) || "COMPANY_ADMIN".equalsIgnoreCase(userRole) || "Admin".equalsIgnoreCase(userRole);
        boolean isHrManager = "HR Manager".equalsIgnoreCase(userRole) || "HR_MANAGER".equalsIgnoreCase(userRole);

        if (!isSuperAdmin && !isCompanyAdmin && !isHrManager) {
            throw new BadRequestException("Access denied: Only COMPANY_ADMIN, HR_MANAGER, or SUPER_ADMIN can add departments");
        }

        String targetCompanyId;
        if (isSuperAdmin) {
            targetCompanyId = (request.getCompanyId() != null && !request.getCompanyId().isBlank())
                    ? request.getCompanyId()
                    : userCompanyId;
        } else {
            // COMPANY_ADMIN or HR_MANAGER can strictly create department for their own company
            if (userCompanyId == null || userCompanyId.isBlank()) {
                throw new BadRequestException("No company assigned to current administrator account");
            }

            if (request.getCompanyId() != null && !request.getCompanyId().isBlank() && !request.getCompanyId().equalsIgnoreCase(userCompanyId)) {
                throw new BadRequestException("Access denied: You are logged in with Company ID '" + userCompanyId + "' and cannot create departments for another company ID '" + request.getCompanyId() + "'");
            }
            targetCompanyId = userCompanyId;
        }

        String code = request.getCode().trim().toUpperCase();
        String name = request.getName().trim();

        Department dept = Department.builder()
                .companyId(targetCompanyId)
                .name(name)
                .code(code)
                .headOfDepartment(request.getHeadOfDepartment() != null ? request.getHeadOfDepartment() : "")
                .color(request.getColor() != null ? request.getColor() : "#6366f1")
                .totalEmployees(0)
                .build();

        Department saved = departmentRepository.save(dept);

        // Update company totalDepartments count if company exists
        companyRepository.findById(targetCompanyId).ifPresent(c -> {
            c.setTotalDepartments(c.getTotalDepartments() + 1);
            companyRepository.save(c);
        });

        log.info("Department '{}' ({}) created for Company ID: {} by user: {}", saved.getName(), saved.getCode(), targetCompanyId, currentUser.getEmail());
        return mapDepartmentToDto(saved);
    }

    @Transactional
    public void deleteDepartment(String id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        UserPrincipal currentUser = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new BadRequestException("User authentication required"));

        String userRole = currentUser.getRole();
        String userCompanyId = currentUser.getCompanyId();
        boolean isSuperAdmin = "Super Admin".equalsIgnoreCase(userRole) || "SUPER_ADMIN".equalsIgnoreCase(userRole);

        if (!isSuperAdmin && (userCompanyId == null || !dept.getCompanyId().equalsIgnoreCase(userCompanyId))) {
            throw new BadRequestException("Access denied: You can only delete departments belonging to your own company (" + userCompanyId + ")");
        }

        departmentRepository.delete(dept);

        companyRepository.findById(dept.getCompanyId()).ifPresent(c -> {
            c.setTotalDepartments(Math.max(0, c.getTotalDepartments() - 1));
            companyRepository.save(c);
        });
    }

    // Designations
    @Transactional(readOnly = true)
    public List<DesignationDto> getAllDesignations() {
        return designationRepository.findAll().stream()
                .map(this::mapDesignationToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DesignationDto saveDesignation(Designation designation) {
        return mapDesignationToDto(designationRepository.save(designation));
    }

    // Mappers
    public CompanyDto mapCompanyToDto(CompanyProfile c) {
        return CompanyDto.builder()
                .id(c.getId())
                .code(c.getCode())
                .companyName(c.getCompanyName())
                .tagline(c.getTagline())
                .industry(c.getIndustry())
                .type(c.getType())
                .status(c.getStatus())
                .website(c.getWebsite())
                .taxId(c.getTaxId())
                .registrationNumber(c.getRegistrationNumber())
                .phone(c.getPhone())
                .email(c.getEmail())
                .address(c.getAddress())
                .city(c.getCity())
                .state(c.getState())
                .zipCode(c.getZipCode())
                .country(c.getCountry())
                .currency(c.getCurrency())
                .timeZone(c.getTimeZone())
                .totalEmployees(c.getTotalEmployees())
                .totalDepartments(c.getTotalDepartments())
                .isDefault(c.isDefault())
                .brandColor(c.getBrandColor())
                .establishedDate(c.getEstablishedDate())
                .build();
    }

    public DepartmentDto mapDepartmentToDto(Department d) {
        return DepartmentDto.builder()
                .id(d.getId())
                .companyId(d.getCompanyId())
                .name(d.getName())
                .code(d.getCode())
                .headOfDepartment(d.getHeadOfDepartment())
                .totalEmployees(d.getTotalEmployees())
                .color(d.getColor())
                .build();
    }

    public DesignationDto mapDesignationToDto(Designation d) {
        return DesignationDto.builder()
                .id(d.getId())
                .companyId(d.getCompanyId())
                .title(d.getTitle())
                .department(d.getDepartment())
                .level(d.getLevel())
                .build();
    }
}
