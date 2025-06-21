package com.example.stoic.User.Controller;

import com.example.stoic.User.Model.User;
import com.example.stoic.User.DTO.LoginRequest;
import com.example.stoic.User.DTO.RegisterResponse;
import com.example.stoic.User.Model.UserRole;
import com.example.stoic.User.Service.UserServiceImpl;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@CrossOrigin(origins = {
    "http://192.168.1.6:8081",
    "exp://192.168.210.193:8081",
    "http://localhost:8081",
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

    @PostMapping
    public ResponseEntity<User> saveUser(@RequestBody User user) {
        if (user.getUserRole() == null) {
            user.setUserRole(UserRole.REG);
        }
        User savedUser = userService.save(user);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

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
    public ResponseEntity<RegisterResponse> register(@RequestBody User user) {
        try {
            user.setUserRole(UserRole.REG);
            User savedUser = userService.register(user);

            RegisterResponse response = new RegisterResponse("User registered successfully", savedUser.getUserId());
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new RegisterResponse("Error: " + e.getMessage(), -1));
        }
    }
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        try {
            User user = userService.login(loginRequest.getEmail(), loginRequest.getPassword());
            session.setAttribute("user", user); // Store user in session
            return ResponseEntity.ok("Login successful");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @GetMapping("/session")
    public ResponseEntity<?> getSessionUser(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            return ResponseEntity.ok(
                new UserSessionResponse(user.getUsername(), user.getUserRole().name())
            );
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No active session");
        }
    }

    static class UserSessionResponse {
        public String username;
        public String role;

        public UserSessionResponse(String username, String role) {
            this.username = username;
            this.role = role;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out");
    }
}