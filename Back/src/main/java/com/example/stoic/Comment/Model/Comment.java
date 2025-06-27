package com.example.stoic.Comment.Model;

import com.example.stoic.Post.Model.Post;

import com.example.stoic.User.Model.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "comments")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false, name = "id")
    private int id;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Column(name = "content", nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @ManyToMany
    @JoinTable(name = "comment_likes", joinColumns = @JoinColumn(name = "comment_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private List<User> likes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "no_reports")
    private int report = 0;

    public boolean Getlikes(User user) {
        for (User u : likes) {
            if (u.getUserId() == user.getUserId()) {
                return true;
            }
        }
        return false;

    }

    public List<User> removelike(User user) {
        System.out.println("Removing like from user: " + likes.getFirst().getUsername());
        likes.remove(user);
        System.out.println("Post likes after unliking: " + likes.getFirst().getUsername());
        return likes;
    }

}