package com.example.stoic.ChatMessage.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int userId;
    private String sender; // "USER" or "AI"

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime timestamp;
}
