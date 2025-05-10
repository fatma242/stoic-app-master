package com.example.stoic.Notification.Service;

import com.example.stoic.Notification.Model.Notification;

import java.util.List;

public interface NotificationService {



    List<Notification> getAllNotifications();

    Notification getNotificationById(int id);

    Notification createNotification(Notification notification);



    void deleteNotificationById(int id);
}

