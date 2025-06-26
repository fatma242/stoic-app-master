package com.example.stoic.Post.Model;

import com.example.stoic.Post.Repo.PostRepo;
import com.example.stoic.Room.Model.Room;
import com.example.stoic.User.Model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.google.api.services.storage.Storage.BucketAccessControls.Get;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "post")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(unique = true, nullable = false, name = "id")
    private int id;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "title", nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    // @Column(name = "likes", nullable = true)
    @ManyToMany
    @JoinTable(name = "post_likes", joinColumns = @JoinColumn(name = "post_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private List<User> likes = new ArrayList<>();
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

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