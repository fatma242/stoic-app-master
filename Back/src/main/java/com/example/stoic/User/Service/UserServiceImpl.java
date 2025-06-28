package com.example.stoic.User.Service;

import com.example.stoic.User.Model.OnboardingStatus;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Model.UserRole;
import com.example.stoic.User.Repo.UserRepo;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepo userRepo;

    public UserServiceImpl(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public List<User> findAll() {
        return userRepo.findAll();
    }

    @Override
    public User findById(int id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User with ID " + id + " not found"));
    }

    @Override
    public User save(User user) {
        try {
            return userRepo.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Error saving user: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteById(int id) {
        if (!userRepo.existsById(id)) {
            throw new NoSuchElementException("User with ID " + id + " not found, cannot delete.");
        }
        userRepo.deleteById(id);
    }

    @Override
    public User update(User user) {
        if (!userRepo.existsById(user.getUserId())) {
            throw new RuntimeException("User not found with id: " + user.getUserId());
        }
        return userRepo.save(user);
    }

    @Override
    public User register(User user) {
        if (userRepo.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        return userRepo.save(user);
    }

    @Override
    public User login(String email, String password) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        if (!user.getPassword().equals(password)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Incorrect password");
        }

        return user;
    }

    @Override
    public void submitStatus(int userId, OnboardingStatus moodKey) {
        User user = findById(userId);
        user.setStatus(moodKey);
        userRepo.save(user);
    }

    @Override
    public OnboardingStatus getStatus(int userId) {
        User user = findById(userId);
        return user.getStatus();
    }

    @Override
    public User findByUsername(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("User with username " +
                        username + " not found"));
    }

    @Override
    public int getAge(int userId) {
        User user = findById(userId);
        return user.getAge();
    }

    @Override
    public String getGender(int userId) {
        User user = findById(userId);
        return user.getGender();
    }

    @Override
    public UserRole getUserRole(int userId) {
        User user = findById(userId);
        return user.getUserRole();
    }
}
