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
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "email", nullable = false, unique = true, columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin")
    private String email;

    @Column(name = "password", nullable = false)
    private String password;
    @Column(name = "age", nullable = false)
    private int age;
    @Column(name = "gender", nullable = false)
    private String gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "userRole", columnDefinition = "ENUM('REG','ADMIN') DEFAULT 'REG'")
    private UserRole userRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "onboarding_status", columnDefinition = "ENUM('NORMAL', 'STRESS', 'ANXIETY', 'DEPRESSION', 'SUICIDAL')")
    private OnboardingStatus onboardingStatus;

    public void setStatus(OnboardingStatus status) {
        this.onboardingStatus = status;
    }

    public OnboardingStatus getStatus() {
        return onboardingStatus;
    }

    @JsonIgnore
    @ManyToMany(mappedBy = "Users")
    private List<Room> rooms;

    

}
