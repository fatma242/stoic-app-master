package com.example.stoic.User.Controller;

import com.example.stoic.User.Model.OnboardingStatus;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.DTO.LoginRequest;
import com.example.stoic.User.DTO.LoginResponse;
import com.example.stoic.User.Model.UserRole;
import com.example.stoic.User.Repo.UserRepo;
import com.example.stoic.User.Service.UserServiceImpl;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.servlet.http.HttpSession;
import lombok.Data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@CrossOrigin(origins = {
        "${UserIphttp}", "${UserIPexp}", "${UserIphttp}",
}, allowCredentials = "true")
@RestController
@RequestMapping("/api/users")
public class UserController {
    UserRepo userRepo;
    private final UserServiceImpl userService;

    public UserController(UserServiceImpl userService, UserRepo userRepo) {
        this.userService = userService;
        this.userRepo = userRepo;
    }

    @GetMapping
    public ResponseEntity<List<User>> getUsers() {
        List<User> users = userService.findAll();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id) {
        User user = userService.findById(id);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/test")
    public void test() {
        System.out.println("Test endpoint hit!");
        // You can add more logic here if needed
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUserById(@PathVariable int id) {
        userService.deleteById(id);
        return new ResponseEntity<>("User with ID " + id + " deleted.", HttpStatus.NO_CONTENT);
    }

    /*
     * @PostMapping
     * public ResponseEntity<User> saveUser(@RequestBody User user) {
     * if (user.getUserRole() == null) {
     * user.setUserRole(UserRole.REG);
     * }
     * User savedUser = userService.save(user);
     * return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
     * }
     */

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable int id, @RequestBody User userDetails) {
        User user = userService.findById(id);
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setUserRole(userDetails.getUserRole());
        user.setPassword(userDetails.getPassword());
        user.setStatus(userDetails.getStatus());
        User updatedUser = userService.update(user);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user, HttpSession session) {
        try {
            user.setUserRole(UserRole.REG); // default role
            user.setOnboardingStatus(OnboardingStatus.NORMAL); // default status
            User registeredUser = userService.register(user);
            // Create session immediately after registration
            session.setAttribute("user", registeredUser);

            return ResponseEntity.ok(new RegisterResponse(
                    "Registered successfully",
                    registeredUser.getUserId(),
                    registeredUser.getUsername(),
                    registeredUser.getEmail(),
                    registeredUser.getUserRole().name(),
                    registeredUser.getOnboardingStatus().name()));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("Admin")
    public void postMethodName() {
        try {
            // Check if default user already exists
            if (userRepo.findByEmail("admin@stoic.com").isEmpty()) {
                User defaultUser = new User();
                defaultUser.setUsername("Admin");
                defaultUser.setEmail("admin@stoic.com");
                defaultUser.setPassword("admin123"); // Plain text password (not recommended for production)
                defaultUser.setAge(22);
                defaultUser.setGender("Male");
                defaultUser.setUserRole(UserRole.ADMIN);
                // Set any other required fields based on your User model

                userRepo.save(defaultUser);
                System.out.println("✅ Default user created successfully!");
                System.out.println("📧 Email: admin@stoic.com");
                System.out.println("🔑 Password: admin123");
            } else {
                System.out.println("ℹ️ Default user already exists in database");
            }
        } catch (Exception e) {
            System.err.println("❌ Error creating default user: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest req,
            HttpSession session) {
        User u = userService.login(req.getEmail(), req.getPassword());
        session.setAttribute("user", u);
        return ResponseEntity
                .ok(new LoginResponse(String.valueOf(u.getUserId()), u.getEmail(), u.getUserRole().name()));
    }

    static class UserSessionResponse {
        public String username;
        public String role;

        public UserSessionResponse(String username, String role) {
            this.username = username;
            this.role = role;
        }
    }

    static class ErrorResponse {
        public String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }

    static class RegisterResponse {
        public String message;
        public int userId;
        public String username;
        public String email;
        public String role;
        public String onboardingStatus;

        public RegisterResponse(String message, int userId, String username, String email, String role,
                String onboardingStatus) {
            this.message = message;
            this.userId = userId;
            this.username = username;
            this.email = email;
            this.role = role;
            this.onboardingStatus = onboardingStatus;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out");
    }

    @PostMapping("/submit-status")
    public ResponseEntity<?> submitUserStatus(@RequestBody StatusRequest statusRequest) {
        System.out.println("📥 RECEIVED submit-status for user " + statusRequest.getUserId() + " with status "
                + statusRequest.getStatus());

        try {
            Integer userId = statusRequest.getUserId();
            OnboardingStatus status = statusRequest.getStatus();

            userService.submitStatus(userId, status);
            return ResponseEntity.ok("Status updated successfully");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @Data
    static class StatusRequest {
        private int userId;

        @JsonProperty("status")
        private OnboardingStatus status;
    }

    @GetMapping("/status/{userId}")
    public ResponseEntity<OnboardingStatus> getStatus(@PathVariable int userId) {
        try {
            OnboardingStatus status = userService.getStatus(userId);
            return ResponseEntity.ok(status);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/age/{userId}")
    public ResponseEntity<Integer> getAge(@PathVariable int userId) {
        try {
            Integer age = userService.getAge(userId);
            return ResponseEntity.ok(age);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/gender/{userId}")
    public ResponseEntity<String> getGender(@PathVariable int userId) {
        try {
            String gender = userService.getGender(userId);
            return ResponseEntity.ok(gender);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

    }

    @GetMapping("/role/{userId}")
    public ResponseEntity<String> getUserRole(@PathVariable int userId) {
        try {
            UserRole role = userService.getUserRole(userId);
            return ResponseEntity.ok(role.name());
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

}