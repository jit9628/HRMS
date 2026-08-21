package com.hrms.modulith.notification;

import com.hrms.modulith.common.dto.ApiResponse;
import com.hrms.modulith.notification.dto.AnnouncementDto;
import com.hrms.modulith.notification.dto.CreateAnnouncementRequest;
import com.hrms.modulith.notification.dto.NotificationDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications & Announcements", description = "Endpoints for broadcast announcements and personal alerts")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/announcements")
    @Operation(summary = "Get all company announcements")
    public ResponseEntity<ApiResponse<List<AnnouncementDto>>> getAnnouncements() {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getAnnouncements()));
    }

    @PostMapping("/announcements")
    @Operation(summary = "Publish a company announcement")
    public ResponseEntity<ApiResponse<AnnouncementDto>> createAnnouncement(@Valid @RequestBody CreateAnnouncementRequest request) {
        AnnouncementDto announcement = notificationService.createAnnouncement(request);
        return new ResponseEntity<>(ApiResponse.ok("Announcement published", announcement), HttpStatus.CREATED);
    }

    @GetMapping("/my-notifications")
    @Operation(summary = "Get notifications for current user")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getMyNotifications(@RequestParam(required = false) String employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getNotificationsForUser(employeeId)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", null));
    }
}
