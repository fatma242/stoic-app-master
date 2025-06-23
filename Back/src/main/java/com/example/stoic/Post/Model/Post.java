package com.example.stoic.Post.Model;

import com.example.stoic.Room.Model.Room;
import com.example.stoic.User.Model.User;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "post")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(unique = true, nullable = false, name = "id")
    private int id;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Column(name = "content", nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @Column(name = "like", nullable = true)
    private int like;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
}