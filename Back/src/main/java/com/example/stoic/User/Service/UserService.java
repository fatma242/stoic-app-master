package com.example.stoic.User.Service;

import com.example.stoic.User.Model.OnboardingStatus;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Model.UserRole;

import java.util.List;

public interface UserService {

    List<User> findAll();

    User findById(int id);

    User save(User user);

    void deleteById(int id);

    User update(User user);

    User register(User user);

    User login(String email, String password);
    User findByUsername(String username);

    void submitStatus(int userId, OnboardingStatus moodKey);

    OnboardingStatus getStatus(int userId);

    int getAge(int userId);
    String getGender(int userId);

    public UserRole getUserRole(int userId);

}
