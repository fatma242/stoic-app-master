package com.example.stoic.User.DTO;

public class RegisterResponse {
    private String message;
    private int userId;

    public RegisterResponse(String message, int userId) {
        this.message = message;
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public int getUserId() {
        return userId;
    }
}
