package com.hrms.modulith.notification;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationLog extends BaseEntity {

    @Column(name = "recipient_id")
    private String recipientId; // null means broadcast / all

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", length = 1000, nullable = false)
    private String message;

    @Column(name = "type")
    private String type; // INFO, SUCCESS, WARNING, ALERT

    @Column(name = "is_read")
    private boolean isRead;

    @Column(name = "notification_timestamp")
    private LocalDateTime timestamp;
}
