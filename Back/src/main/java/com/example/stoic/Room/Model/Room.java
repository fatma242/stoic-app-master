package com.example.stoic.Room.Model;

import com.example.stoic.Post.Model.Post;
import com.example.stoic.User.Model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "room")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "room_id", updatable = false, nullable = false)
    private int roomId;

    @Column(name = "owner_id")
    private int ownerId;

    @Column(name = "room_name")
    private String roomName;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private RoomType type;

    @JsonIgnore
    @Column(name = "created_at")
    private Date createdAt;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts = new ArrayList<>();

    @Column(name = "join_code", unique = true, updatable = false, nullable = false)
    private String join_code;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_rooms", joinColumns = @JoinColumn(name = "room_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private List<User> Users;

    @PrePersist
    public void generateJoinCode() {
        if (this.join_code == null || this.join_code.isEmpty()) {
            this.join_code = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        }
    }

    public void adduser(User user) {
        if (this.Users == null) this.Users = new ArrayList<>();
        Users.add(user);
    }

    public void removeUser(User user) {
        if (this.Users != null) this.Users.remove(user);
    }

    // Getters and Setters

    public int getRoomId() { return roomId; }
    public void setRoomId(int roomId) { this.roomId = roomId; }

    public int getOwnerId() { return ownerId; }
    public void setOwnerId(int ownerId) { this.ownerId = ownerId; }

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }

    public RoomType getType() { return type; }
    public void setType(RoomType type) { this.type = type; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public List<Post> getPosts() { return posts; }
    public void setPosts(List<Post> posts) { this.posts = posts; }

    public String getJoin_code() { return join_code; }
    public void setJoin_code(String join_code) { this.join_code = join_code; }

    public List<User> getUsers() { return Users; }
    public void setUsers(List<User> users) { Users = users; }
}
