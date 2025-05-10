package com.example.stoic.Notification.Service;

import com.example.stoic.Notification.Model.Notification;
import com.example.stoic.Notification.Repo.NotificationRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepo notificationRepo;

    public NotificationServiceImpl(NotificationRepo notificationRepo) {
        this.notificationRepo = notificationRepo;
    }

    @Override
    public List<Notification> getAllNotifications() {
        return notificationRepo.findAll();
    }

    @Override
    public Notification getNotificationById(int id) {
        Optional<Notification> notification = notificationRepo.findById(id);
        return notification.orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
    }

    @Override
    public Notification createNotification(Notification notification) {
        return notificationRepo.save(notification);
    }

   

    @Override
    public void deleteNotificationById(int id) {
        notificationRepo.deleteById(id);
    }
}