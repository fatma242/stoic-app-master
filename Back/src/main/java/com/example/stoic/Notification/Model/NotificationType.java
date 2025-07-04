package com.example.stoic.Notification.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;

public enum NotificationType {
    USER_JOINED,
    POST_CREATED,
    COMMENT_ADDED,
    SYSTEM_UPDATE,
    REMINDER,
    POST_LIKED,
    COMMENT_LIKED,
    USER_REMOVED,
    USER_LEFT,
    MESSAGE
}
