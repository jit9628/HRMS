package com.hrms.modulith.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private String id;
    private String recipientId;
    private String title;
    private String message;
    private String type;
    private boolean isRead;
    private LocalDateTime timestamp;
}
