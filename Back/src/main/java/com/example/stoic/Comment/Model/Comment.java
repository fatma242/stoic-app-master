package com.example.stoic.Comment.Model;

import com.example.stoic.Post.Model.Post;

import com.example.stoic.User.Model.User;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "comment")
public class Comment {
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
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "no_reports")
    private int report = 0;

}