package com.example.stoic.Notification.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.stoic.Notification.Model.Notification;
import com.example.stoic.Notification.Service.NotificationServiceImpl;

@CrossOrigin(origins = {
        "http://192.168.1.6:8081",
        "http://192.168.20.179:8081",
        "exp://192.168.20.179:8081",
        "exp://192.168.1.6:8081",
        "exp://192.168.210.193:8081",
        "http://localhost:8081",
}, allowCredentials = "true")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationServiceImpl notificationService;

    public NotificationController(NotificationServiceImpl notificationService) {
        this.notificationService = notificationService;
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
}