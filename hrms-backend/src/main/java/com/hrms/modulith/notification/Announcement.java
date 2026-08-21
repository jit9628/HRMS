package com.hrms.modulith.notification;

import com.hrms.modulith.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "announcements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", length = 2000, nullable = false)
    private String content;

    @Column(name = "announcement_date")
    private LocalDate date;

    @Column(name = "author")
    private String author;

    @Column(name = "category")
    private String category; // Event, Policy, Update, Celebration

    @Column(name = "priority")
    private String priority; // Normal, Urgent
}
