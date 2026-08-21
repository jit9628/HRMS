package com.hrms.modulith.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, String> {

    List<NotificationLog> findByRecipientIdOrRecipientIdIsNullOrderByTimestampDesc(String recipientId);

    long countByRecipientIdAndIsReadFalse(String recipientId);
}
