package com.example.stoic.Notification.Service;

import com.example.stoic.Notification.Model.Notification;
import com.example.stoic.Notification.Model.NotificationType;
import com.example.stoic.Notification.Repo.NotificationRepo;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepo notificationRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // For REAL-TIME WebSocket messaging

    @Override
    public Notification createNotification(User user, String title, String message, NotificationType type) {
        try {
            Notification notification = new Notification(user, title, message, type);
            Notification savedNotification = notificationRepo.save(notification);

            // 🚀 SEND REAL-TIME NOTIFICATION via WebSocket
            sendRealTimeNotification(user.getUserId(), savedNotification);

            System.out.println("✅ REAL-TIME notification sent to user: " + user.getUsername());
            System.out.println("📢 Title: " + title);
            System.out.println("📝 Message: " + message);

            return savedNotification;

        } catch (Exception e) {
            System.err.println("❌ Error creating notification: " + e.getMessage());
            throw new RuntimeException("Failed to create notification", e);
        }
    }

    // 🚀 REAL-TIME notification sender
    private void sendRealTimeNotification(int userId, Notification notification) {
        try {
            NotificationDTO notificationDTO = new NotificationDTO(notification);

            // Send to specific user via WebSocket
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + userId,
                    notificationDTO);

            System.out.println("🚀 REAL-TIME notification sent via WebSocket to user: " + userId);

        } catch (Exception e) {
            System.err.println("❌ Error sending real-time notification: " + e.getMessage());
        }
    }

    @Override
    public void sendNotificationToUser(int userId, String title, String message, NotificationType type) {
        try {
            Optional<User> userOpt = userRepo.findById(userId);
            if (userOpt.isPresent()) {
                createNotification(userOpt.get(), title, message, type);
            } else {
                throw new RuntimeException("User not found with id: " + userId);
            }
        } catch (Exception e) {
            System.err.println("❌ Error sending notification to user: " + e.getMessage());
            throw new RuntimeException("Failed to send notification to user", e);
        }
    }

    @Override
    public List<Notification> getUserNotifications(int userId) {
        return notificationRepo.findByUserUserIdAndIsReadFalseOrderBySentAtDesc(userId);
    }

    @Override
    public List<Notification> getUnreadNotifications(int userId) {
        return notificationRepo.findByUserUserIdAndIsReadFalseOrderBySentAtDesc(userId);
    }

    @Override
    public int getUnreadCount(int userId) {
        return notificationRepo.countUnreadNotificationsByUserId(userId);
    }

    @Override
    public boolean markAsRead(int notificationId, int userId) {
        try {
            Optional<Notification> notificationOpt = notificationRepo.findById(notificationId);

            if (notificationOpt.isPresent()) {
                Notification notification = notificationOpt.get();

                if (notification.getUser().getUserId() != userId) {
                    return false;
                }

                notification.setIsRead(true);
                notificationRepo.save(notification);

                // 🚀 Send REAL-TIME update about read status
                messagingTemplate.convertAndSend(
                        "/topic/notifications/" + userId + "/read",
                        notificationId);

                System.out.println("✅ Notification marked as read and sent real-time update: " + notificationId);
                return true;
            }
            return false;

        } catch (Exception e) {
            System.err.println("❌ Error marking notification as read: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean markAllAsRead(int userId) {
        try {
            List<Notification> unreadNotifications = getUnreadNotifications(userId);

            for (Notification notification : unreadNotifications) {
                notification.setIsRead(true);
            }

            notificationRepo.saveAll(unreadNotifications);

            // 🚀 Send REAL-TIME update about all notifications being read
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + userId + "/read-all",
                    "all-read");

            System.out.println("✅ All notifications marked as read with real-time update for user: " + userId);
            return true;

        } catch (Exception e) {
            System.err.println("❌ Error marking all notifications as read: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean deleteNotification(int notificationId, int userId) {
        try {
            Optional<Notification> notificationOpt = notificationRepo.findById(notificationId);

            if (notificationOpt.isPresent()) {
                Notification notification = notificationOpt.get();

                if (notification.getUser().getUserId() != userId) {
                    return false;
                }

                notificationRepo.delete(notification);

                // 🚀 Send REAL-TIME update about deletion
                messagingTemplate.convertAndSend(
                        "/topic/notifications/" + userId + "/deleted",
                        notificationId);

                System.out.println("✅ Notification deleted with real-time update: " + notificationId);
                return true;
            }
            return false;

        } catch (Exception e) {
            System.err.println("❌ Error deleting notification: " + e.getMessage());
            return false;
        }
    }

    @Override
    public Notification createNotification(Notification notification) {
        return notificationRepo.save(notification);
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
    public void deleteNotificationById(int id) {
        notificationRepo.deleteById(id);
    }

    // NotificationServiceImpl.java
    // NotificationServiceImpl.java
    @Override
    public void markAllReadForUser(int userId) {
        List<Notification> unread = notificationRepo.findByUserUserIdAndIsReadFalse(userId);
        System.out.println("Marking " + unread.size() + " notifications as read for user: " + userId);

        unread.forEach(n -> {
            n.setRead(true);
            n.setReceivedAt(LocalDateTime.now());
        });

        notificationRepo.saveAll(unread);
    }

}

// DTO for REAL-TIME notifications
class NotificationDTO {
    private int id;
    private String title;
    private String message;
    private String type;
    private LocalDateTime createdAt;
    private boolean isRead;

    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.title = notification.getTitle();
        this.message = notification.getContent();
        this.type = notification.getType().toString();
        this.createdAt = notification.getSentAt();
        this.isRead = notification.isRead();
    }

    // Getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

}