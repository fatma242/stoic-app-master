package com.example.stoic.Notification.Model;

import com.example.stoic.User.Model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name="id")
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name="type",nullable = false)
    private NotificationType type;

    @Column(name="content",nullable = false)
    private String content;

    @Column(name="sent_at")
    private LocalDateTime sentAt;

    @Column(name="received_at")
    private LocalDateTime receivedAt;

    @Column(name="is_read")
    private boolean isRead = false;


}
