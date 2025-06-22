// src/main/java/com/example/stoic/web/dto/LoginResponse.java
package com.example.stoic.User.DTO;

public class LoginResponse {
    private final String userId;
    private final String email;

    public LoginResponse(String userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }
}
