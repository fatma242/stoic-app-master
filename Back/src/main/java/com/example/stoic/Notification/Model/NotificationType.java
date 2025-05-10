package com.example.stoic.Notification.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;

public enum NotificationType {
    REMINDER,
    MESSAGE,
    POST
}
