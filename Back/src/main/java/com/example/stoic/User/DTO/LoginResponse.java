// src/main/java/com/example/stoic/web/dto/LoginResponse.java
package com.example.stoic.User.DTO;

public class LoginResponse {
    private final String userId;
    private final String email;
    private final String role;

    public LoginResponse(String userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;   
    }

    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}
