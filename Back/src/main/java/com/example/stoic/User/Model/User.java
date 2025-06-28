package com.example.stoic.User.Model;

import com.example.stoic.Language.Language;
import com.example.stoic.Room.Model.Room;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.List;

@Entity
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
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

    @JsonIgnore
    @ManyToMany(mappedBy = "Users")
    private List<Room> rooms;

    // Getters and Setters

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public UserRole getUserRole() { return userRole; }
    public void setUserRole(UserRole userRole) { this.userRole = userRole; }

    public OnboardingStatus getOnboardingStatus() { return onboardingStatus; }
    public void setOnboardingStatus(OnboardingStatus onboardingStatus) { this.onboardingStatus = onboardingStatus; }

    public List<Room> getRooms() { return rooms; }
    public void setRooms(List<Room> rooms) { this.rooms = rooms; }

    public void setStatus(OnboardingStatus status) {
        this.onboardingStatus = status;
    }

    public OnboardingStatus getStatus() {
        return onboardingStatus;
    }

}
