package com.example.stoic.Notification.Service;

import com.example.stoic.Notification.Model.Notification;
import com.example.stoic.Notification.Model.NotificationType;
import com.example.stoic.User.Model.User;

import java.util.List;

import org.springframework.data.relational.core.sql.In;

public interface NotificationService {

    Notification createNotification(User user, String title, String message, NotificationType type);

    void sendNotificationToUser(int userId, String title, String message, NotificationType type);

    List<Notification> getUserNotifications(int userId);

    List<Notification> getUnreadNotifications(int userId);

    int getUnreadCount(int userId);

    boolean markAsRead(int notificationId, int userId);

    boolean markAllAsRead(int userId);

    boolean deleteNotification(int notificationId, int userId);

    Notification createNotification(Notification notification);

    List<Notification> getAllNotifications();

    Notification getNotificationById(int id);

    void markAllReadForUser(int userId);

    void deleteNotificationById(int id);
}
