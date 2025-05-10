package com.example.stoic.Message.Model;

import com.example.stoic.User.Model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime ;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_message")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private String roomId;

    @Column(name = "sender_id", nullable = false)
    private String senderId;



    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime  sentAt= LocalDateTime.now();
}