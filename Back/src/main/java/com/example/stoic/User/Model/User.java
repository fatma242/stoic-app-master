package com.example.stoic.User.Model;

import com.example.stoic.Language.Language;
import jakarta.persistence.*;
import lombok.Data;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "userRole", columnDefinition = "ENUM('REG','ADMIN','MOD') DEFAULT 'REG'")
    private UserRole userRole;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "room_connected_users", joinColumns = @JoinColumn(name = "room_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private List<User> currentlyConnected;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "room_users", joinColumns = @JoinColumn(name = "room_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private List<User> Users;
}
