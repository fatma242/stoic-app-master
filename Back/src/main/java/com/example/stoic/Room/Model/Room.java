package com.example.stoic.Room.Model;

import com.example.stoic.User.Model.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.Cascade;

@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "created_at")
    private Date createdAt;

    // New unique join code for users
    @Column(name = "join_code", unique = true, updatable = false, nullable = false)
    private String join_code;

    @ManyToMany( fetch = FetchType.LAZY)
    @JoinTable(name = "user_rooms", joinColumns = @JoinColumn(name = "room_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private List<User> Users;

    // Automatically generate a join code before persisting
    @PrePersist
    public void generateJoinCode() {
        if (this.join_code == null || this.join_code.isEmpty()) {
            // Generate a random alphanumeric code; take a substring of UUID to keep it
            // short
            this.join_code = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        }
    }

    //
    public void adduser(User user) {
        if (this.Users == null) {
            this.Users = new ArrayList<>();
        }
        Users.add(user);
    }

    public void removeUser(User user) {
        if (this.Users != null) {
            this.Users.remove(user);
        }
    }
}