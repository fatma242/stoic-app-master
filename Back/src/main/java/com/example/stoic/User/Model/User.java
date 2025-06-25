package com.example.stoic.User.Model;

import com.example.stoic.Language.Language;
import com.example.stoic.Room.Model.Room;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(
    name = "email",
    nullable = false,
    unique = true,
    columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin"
)
private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "userRole", columnDefinition = "ENUM('REG','ADMIN') DEFAULT 'REG'")
    private UserRole userRole;
    
    @JsonIgnore
    @ManyToMany(mappedBy = "Users")
    private List<Room> rooms;

}
