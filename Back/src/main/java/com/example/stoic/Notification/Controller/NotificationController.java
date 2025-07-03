package com.example.stoic.Notification.Controller;

import com.example.stoic.Notification.Model.Notification;
import com.example.stoic.Notification.Model.NotificationType;
import com.example.stoic.Notification.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = {
        "${UserIphttp}",
        "${UserIPexp}"
}, allowCredentials = "true")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable int userId) {
        try {
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable int userId) {
        try {
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}/count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(@PathVariable int userId) {
        try {
            int count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendNotification(@RequestBody SendNotificationRequest request) {
        try {
            notificationService.sendNotificationToUser(
                    request.getUserId(),
                    request.getTitle(),
                    request.getMessage(),
                    NotificationType.valueOf(request.getType().toUpperCase()));
            return ResponseEntity.ok(Map.of("message", "Notification sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to send notification: " + e.getMessage()));
        }
    }

    @PutMapping("/{notificationId}/read/{userId}")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable int notificationId,
            @PathVariable int userId) {
        try {
            boolean success = notificationService.markAsRead(notificationId, userId);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Failed to mark notification as read"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{userId}/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@PathVariable int userId) {
        try {
            boolean success = notificationService.markAllAsRead(userId);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Failed to mark all notifications as read"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{notificationId}/{userId}")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @PathVariable int notificationId,
            @PathVariable int userId) {
        try {
            boolean success = notificationService.deleteNotification(notificationId, userId);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Failed to delete notification"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    // Test endpoint
    @GetMapping("/test/{userId}")
    public ResponseEntity<Map<String, String>> testNotification(@PathVariable int userId) {
        try {
            notificationService.sendNotificationToUser(
                    userId,
                    "Test Notification 🔔",
                    "This is a real-time test notification sent at " + java.time.LocalDateTime.now(),
                    NotificationType.SYSTEM_UPDATE);
            return ResponseEntity.ok(Map.of("message", "Real-time notification sent to user " + userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to send notification: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> notifications = notificationService.getAllNotifications();
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    public ResponseEntity<Notification> getNotificationById(@PathVariable int id) {
        Notification notification = notificationService.getNotificationById(id);
        return new ResponseEntity<>(notification, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification createdNotification = notificationService.createNotification(notification);
        return new ResponseEntity<>(createdNotification, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(@PathVariable int id) {
        notificationService.deleteNotificationById(id);
        return new ResponseEntity<>("Notification with ID " + id + " deleted.", HttpStatus.NO_CONTENT);
    }

    @PostMapping("/mark-read")
    public ResponseEntity<Void> markAllRead(@RequestParam int userId) {
        notificationService.markAllReadForUser(userId);
        return ResponseEntity.ok().build();
    }

    // @GetMapping("/Daily")
    // public String getMethodName(@RequestParam String param) {
    // return new String();
    // }

}

// Request DTO
class SendNotificationRequest {
    private int userId;
    private String title;
    private String message;
    private String type;

    // Getters and Setters
    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
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
}