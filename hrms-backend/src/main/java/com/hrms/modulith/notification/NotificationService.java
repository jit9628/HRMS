package com.hrms.modulith.notification;

import com.hrms.modulith.common.exception.ResourceNotFoundException;
import com.hrms.modulith.employee.EmployeeOnboardedEvent;
import com.hrms.modulith.leave.LeaveAppliedEvent;
import com.hrms.modulith.leave.LeaveApprovedEvent;
import com.hrms.modulith.notification.dto.AnnouncementDto;
import com.hrms.modulith.notification.dto.CreateAnnouncementRequest;
import com.hrms.modulith.notification.dto.NotificationDto;
import com.hrms.modulith.payroll.PayrollProcessedEvent;
import com.hrms.modulith.recruitment.CandidateHiredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final AnnouncementRepository announcementRepository;
    private final NotificationLogRepository notificationRepository;

    // Announcements
    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAnnouncements() {
        return announcementRepository.findAllByOrderByDateDesc().stream()
                .map(this::mapAnnouncementToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AnnouncementDto createAnnouncement(CreateAnnouncementRequest req) {
        Announcement a = Announcement.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .date(LocalDate.now())
                .author(req.getAuthor() != null ? req.getAuthor() : "HR Department")
                .category(req.getCategory() != null ? req.getCategory() : "Update")
                .priority(req.getPriority() != null ? req.getPriority() : "Normal")
                .build();

        a = announcementRepository.save(a);
        return mapAnnouncementToDto(a);
    }

    // In-App Notifications
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsForUser(String recipientId) {
        return notificationRepository.findByRecipientIdOrRecipientIdIsNullOrderByTimestampDesc(recipientId).stream()
                .map(this::mapNotificationToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(String id) {
        NotificationLog n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        n.setRead(true);
        notificationRepository.save(n);
    }

    // ==========================================
    // Spring Modulith Cross-Module Event Listeners
    // ==========================================

    @ApplicationModuleListener
    public void onEmployeeOnboarded(EmployeeOnboardedEvent event) {
        log.info("Notification module handling EmployeeOnboardedEvent for: {}", event.employeeCode());

        NotificationLog n = NotificationLog.builder()
                .recipientId(event.employeeId())
                .title("Welcome to the Team!")
                .message("Welcome aboard " + event.firstName() + "! Your employee code is " + event.employeeCode() + ".")
                .type("SUCCESS")
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .build();
        notificationRepository.save(n);

        // Broadcast Announcement
        Announcement a = Announcement.builder()
                .title("Welcome New Joiner: " + event.firstName() + " " + event.lastName())
                .content(event.firstName() + " " + event.lastName() + " has joined the " + event.department() + " team as " + event.designation() + ". Let's give them a warm welcome!")
                .date(LocalDate.now())
                .author("People Operations")
                .category("Celebration")
                .priority("Normal")
                .build();
        announcementRepository.save(a);
    }

    @ApplicationModuleListener
    public void onLeaveApplied(LeaveAppliedEvent event) {
        log.info("Notification module handling LeaveAppliedEvent: Request #{}", event.leaveRequestId());

        NotificationLog n = NotificationLog.builder()
                .recipientId(null) // Broadcast to HR/Managers
                .title("New Leave Application: " + event.employeeName())
                .message(event.employeeName() + " has applied for " + event.totalDays() + " day(s) of " + event.leaveType() + ".")
                .type("INFO")
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .build();
        notificationRepository.save(n);
    }

    @ApplicationModuleListener
    public void onLeaveApproved(LeaveApprovedEvent event) {
        log.info("Notification module handling LeaveApprovedEvent for: {}", event.employeeName());

        NotificationLog n = NotificationLog.builder()
                .recipientId(event.employeeId())
                .title("Leave Request Approved")
                .message("Your " + event.leaveType() + " request from " + event.startDate() + " to " + event.endDate() + " has been approved.")
                .type("SUCCESS")
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .build();
        notificationRepository.save(n);
    }

    @ApplicationModuleListener
    public void onPayrollProcessed(PayrollProcessedEvent event) {
        log.info("Notification module handling PayrollProcessedEvent for month: {}", event.payrollMonth());

        NotificationLog n = NotificationLog.builder()
                .recipientId(null) // Broadcast to all
                .title("Payroll Processed: " + event.payrollMonth())
                .message("Salaries for " + event.payrollMonth() + " have been successfully processed for " + event.totalEmployeesProcessed() + " employees.")
                .type("SUCCESS")
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .build();
        notificationRepository.save(n);
    }

    @ApplicationModuleListener
    public void onCandidateHired(CandidateHiredEvent event) {
        log.info("Notification module handling CandidateHiredEvent for candidate: {}", event.candidateName());

        NotificationLog n = NotificationLog.builder()
                .recipientId(null)
                .title("Offer Accepted: " + event.candidateName())
                .message(event.candidateName() + " has been marked as HIRED for position '" + event.jobTitle() + "'.")
                .type("SUCCESS")
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .build();
        notificationRepository.save(n);
    }

    private AnnouncementDto mapAnnouncementToDto(Announcement a) {
        return AnnouncementDto.builder()
                .id(a.getId())
                .title(a.getTitle())
                .content(a.getContent())
                .date(a.getDate())
                .author(a.getAuthor())
                .category(a.getCategory())
                .priority(a.getPriority())
                .build();
    }

    private NotificationDto mapNotificationToDto(NotificationLog n) {
        return NotificationDto.builder()
                .id(n.getId())
                .recipientId(n.getRecipientId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.isRead())
                .timestamp(n.getTimestamp())
                .build();
    }
}
