package com.example.stoic.User.Controller;

import com.example.stoic.User.Model.User;
import com.example.stoic.User.DTO.LoginRequest;
import com.example.stoic.User.DTO.LoginResponse;
import com.example.stoic.User.Model.UserRole;
import com.example.stoic.User.Service.UserServiceImpl;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = {
        "http://192.168.1.19:8081",
        "exp://192.168.1.19:8081",
        "http://192.168.1.19:8081",
}, allowCredentials = "true")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserServiceImpl userService;

    public UserController(UserServiceImpl userService) {
        this.userService = userService;
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
        User updatedUser = userService.update(user);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user, HttpSession session) {
        try {
            user.setUserRole(UserRole.REG); // default role
            User registeredUser = userService.register(user);
            // Create session immediately after registration
            session.setAttribute("user", registeredUser);

            return ResponseEntity.ok(new RegisterResponse(
                    "Registered successfully",
                    registeredUser.getUserId(),
                    registeredUser.getUsername(),
                    registeredUser.getEmail(),
                    registeredUser.getUserRole().name()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest req,
            HttpSession session) {
        User u = userService.login(req.getEmail(), req.getPassword());
        session.setAttribute("user", u);
        return ResponseEntity.ok(new LoginResponse(String.valueOf(u.getUserId()), u.getEmail()));
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

        public RegisterResponse(String message, int userId, String username, String email, String role) {
            this.message = message;
            this.userId = userId;
            this.username = username;
            this.email = email;
            this.role = role;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out");
    }
}