package com.hrms.modulith.leave;

import com.hrms.modulith.common.exception.BadRequestException;
import com.hrms.modulith.common.exception.ResourceNotFoundException;
import com.hrms.modulith.employee.EmployeeOnboardedEvent;
import com.hrms.modulith.leave.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final HolidayRepository holidayRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public LeaveBalanceDto getLeaveBalance(String employeeId) {
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> createDefaultBalance(employeeId));

        return mapBalanceToDto(balance);
    }

    @Transactional
    public LeaveRequestDto applyLeave(ApplyLeaveRequest req) {
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        double days = req.getTotalDays() > 0 ? req.getTotalDays()
                : ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;

        LeaveType type = LeaveType.fromString(req.getLeaveType());

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employeeId(req.getEmployeeId())
                .employeeName(req.getEmployeeName())
                .department(req.getDepartment())
                .leaveType(type)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .totalDays(days)
                .reason(req.getReason())
                .status(LeaveStatus.PENDING)
                .appliedOn(LocalDate.now())
                .build();

        leaveRequest = leaveRequestRepository.save(leaveRequest);

        eventPublisher.publishEvent(new LeaveAppliedEvent(
                leaveRequest.getId(),
                leaveRequest.getEmployeeId(),
                leaveRequest.getEmployeeName(),
                leaveRequest.getDepartment(),
                leaveRequest.getLeaveType().getDisplayName(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.getTotalDays(),
                leaveRequest.getReason()
        ));

        log.info("Leave applied by employee {} for {} days", req.getEmployeeId(), days);
        return mapRequestToDto(leaveRequest);
    }

    @Transactional
    public LeaveRequestDto approveLeave(String id, String comments) {
        LeaveRequest req = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", id));

        if (req.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be approved");
        }

        req.setStatus(LeaveStatus.APPROVED);
        req.setApproverComments(comments != null ? comments : "Approved by Manager");
        LeaveRequest savedReq = leaveRequestRepository.save(req);

        // Deduct from balance
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeId(savedReq.getEmployeeId())
                .orElseGet(() -> createDefaultBalance(savedReq.getEmployeeId()));

        switch (req.getLeaveType()) {
            case CASUAL_LEAVE -> balance.setCasualLeaveUsed(balance.getCasualLeaveUsed() + req.getTotalDays());
            case SICK_LEAVE -> balance.setSickLeaveUsed(balance.getSickLeaveUsed() + req.getTotalDays());
            case PAID_LEAVE -> balance.setPaidLeaveUsed(balance.getPaidLeaveUsed() + req.getTotalDays());
            case MATERNITY_PATERNITY -> balance.setMaternityLeaveUsed(balance.getMaternityLeaveUsed() + req.getTotalDays());
            default -> {}
        }
        leaveBalanceRepository.save(balance);

        // Publish event for Attendance & Notification modules!
        eventPublisher.publishEvent(new LeaveApprovedEvent(
                req.getId(),
                req.getEmployeeId(),
                req.getEmployeeName(),
                req.getStartDate(),
                req.getEndDate(),
                req.getLeaveType().getDisplayName(),
                req.getTotalDays()
        ));

        log.info("Approved leave request {} for employee {}", id, req.getEmployeeId());
        return mapRequestToDto(req);
    }

    @Transactional
    public LeaveRequestDto rejectLeave(String id, String comments) {
        LeaveRequest req = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", "id", id));

        if (req.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be rejected");
        }

        req.setStatus(LeaveStatus.REJECTED);
        req.setApproverComments(comments != null ? comments : "Rejected by Manager");
        req = leaveRequestRepository.save(req);

        log.info("Rejected leave request {} for employee {}", id, req.getEmployeeId());
        return mapRequestToDto(req);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getLeaveRequests(String employeeId, String status) {
        List<LeaveRequest> list;
        if (employeeId != null) {
            list = leaveRequestRepository.findByEmployeeIdOrderByAppliedOnDesc(employeeId);
        } else if (status != null) {
            list = leaveRequestRepository.findByStatusOrderByAppliedOnDesc(LeaveStatus.fromString(status));
        } else {
            list = leaveRequestRepository.findAll();
        }

        return list.stream().map(this::mapRequestToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HolidayDto> getHolidays(LocalDate startDate, LocalDate endDate) {
        LocalDate s = startDate != null ? startDate : LocalDate.of(LocalDate.now().getYear(), 1, 1);
        LocalDate e = endDate != null ? endDate : LocalDate.of(LocalDate.now().getYear(), 12, 31);
        return holidayRepository.findByDateBetweenOrderByDateAsc(s, e).stream()
                .map(this::mapHolidayToDto)
                .collect(Collectors.toList());
    }

    @ApplicationModuleListener
    public void onEmployeeOnboarded(EmployeeOnboardedEvent event) {
        log.info("Leave module received EmployeeOnboardedEvent for employee: {} - Initializing leave quota",
                event.employeeId());
        createDefaultBalance(event.employeeId());
    }

    private LeaveBalance createDefaultBalance(String employeeId) {
        LeaveBalance b = LeaveBalance.builder()
                .employeeId(employeeId)
                .casualLeaveTotal(12)
                .casualLeaveUsed(0)
                .sickLeaveTotal(10)
                .sickLeaveUsed(0)
                .paidLeaveTotal(18)
                .paidLeaveUsed(0)
                .maternityLeaveTotal(84)
                .maternityLeaveUsed(0)
                .build();
        return leaveBalanceRepository.save(b);
    }

    private LeaveBalanceDto mapBalanceToDto(LeaveBalance b) {
        return LeaveBalanceDto.builder()
                .employeeId(b.getEmployeeId())
                .casualLeave(new LeaveBalanceDto.BalanceItem(b.getCasualLeaveUsed(), b.getCasualLeaveTotal()))
                .sickLeave(new LeaveBalanceDto.BalanceItem(b.getSickLeaveUsed(), b.getSickLeaveTotal()))
                .paidLeave(new LeaveBalanceDto.BalanceItem(b.getPaidLeaveUsed(), b.getPaidLeaveTotal()))
                .maternityLeave(new LeaveBalanceDto.BalanceItem(b.getMaternityLeaveUsed(), b.getMaternityLeaveTotal()))
                .build();
    }

    private LeaveRequestDto mapRequestToDto(LeaveRequest r) {
        return LeaveRequestDto.builder()
                .id(r.getId())
                .employeeId(r.getEmployeeId())
                .employeeName(r.getEmployeeName())
                .department(r.getDepartment())
                .leaveType(r.getLeaveType().getDisplayName())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .totalDays(r.getTotalDays())
                .reason(r.getReason())
                .status(r.getStatus().getDisplayName())
                .appliedOn(r.getAppliedOn())
                .approverComments(r.getApproverComments())
                .build();
    }

    private HolidayDto mapHolidayToDto(Holiday h) {
        return HolidayDto.builder()
                .id(h.getId())
                .name(h.getName())
                .date(h.getDate())
                .day(h.getDay())
                .type(h.getType())
                .build();
    }
}
