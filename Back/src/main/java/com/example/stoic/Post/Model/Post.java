package com.example.stoic.Post.Model;

import com.example.stoic.Comment.Model.Comment;
import com.example.stoic.Room.Model.Room;
import com.example.stoic.User.Model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "post")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false, name = "id")
    private int id;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "title", nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Comment> comments = new ArrayList<>();

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinTable(name = "post_likes", joinColumns = @JoinColumn(name = "post_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private List<User> likes = new ArrayList<>();

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // Getters and Setters

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    public List<User> getLikes() { return likes; }
    public void setLikes(List<User> likes) { this.likes = likes; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public boolean Getlikes(User user) {
        for (User u : likes) {
            if (u.getUserId() == user.getUserId()) {
                return true;
            }
        }
        return false;
    }

    public List<User> removelike(User user) {
        likes.remove(user);
        return likes;
    }
}
