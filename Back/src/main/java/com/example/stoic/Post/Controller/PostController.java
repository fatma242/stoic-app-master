package com.example.stoic.Post.Controller;

import com.example.stoic.Post.Model.Post;
import com.example.stoic.Post.Service.PostServiceImpl;
import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.Repo.RoomRepo;
import com.example.stoic.Room.Service.RoomService;
import com.example.stoic.Room.Service.RoomServiceImpl;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpSession;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Model.UserRole;
import com.example.stoic.User.Service.UserServiceImpl;

@CrossOrigin(origins = {
       " ${UserIphttp}",
        "${UserIPexp}"
}, allowCredentials = "true")
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostServiceImpl postService;
    private final RoomServiceImpl roomServiceImpl;
    private final UserServiceImpl userServiceImpl;

    public PostController(PostServiceImpl postService, RoomServiceImpl RoomServiceImpl,
            UserServiceImpl userServiceImpl) {
        this.postService = postService;
        this.roomServiceImpl = RoomServiceImpl;
        this.userServiceImpl = userServiceImpl;
    }

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postService.findAllPosts();
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable int id) {
        Post post = postService.findPostById(id);
        return new ResponseEntity<>(post, HttpStatus.OK);
    }

    @PostMapping("/bypass-test")
    public ResponseEntity<?> bypassTestPost(@RequestBody Map<String, Object> request) {
        try {
            // Log request data
            System.out.println("Received bypass test request: " + request);

            // Extract data
            String title = (String) request.get("title");
            String content = (String) request.get("content");
            Integer roomId = (Integer) request.get("roomId");
            Integer userId = (Integer) request.get("userId");

            if (title == null || content == null || roomId == null || userId == null) {
                return new ResponseEntity<>("Missing required fields", HttpStatus.BAD_REQUEST);
            }

            // Create and save the post directly using the repository
            // This bypasses any service-layer authentication
            Room room = roomServiceImpl.findRoomById(roomId);
            User user = userServiceImpl.findById(userId);

            Post post = new Post();
            post.setTitle(title);
            post.setContent(content);
            post.setAuthor(user);
            post.setDate(LocalDateTime.now());
            post.setRoom(room);

            // Access the repository directly if possible
            // If not accessible, modify your service to have a bypass method
            Post savedPost = postService.savePost(post);

            return new ResponseEntity<>(savedPost, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/test-create")
    public ResponseEntity<?> testCreatePost(@RequestBody Map<String, Object> request) {
        try {
            // Log request data
            System.out.println("Received test request: " + request);

            // Extract data from request
            String title = (String) request.get("title");
            String content = (String) request.get("content");
            Integer roomId = (Integer) request.get("roomId");
            Integer userId = (Integer) request.get("userId"); // Added for testing

            if (title == null || content == null || roomId == null || userId == null) {
                return new ResponseEntity<>("Missing required fields: title, content, roomId, userId",
                        HttpStatus.BAD_REQUEST);
            }

            // Find the room
            Room room = roomServiceImpl.findRoomById(roomId);
            if (room == null) {
                return new ResponseEntity<>("Room not found with id: " + roomId,
                        HttpStatus.NOT_FOUND);
            }

            // Get user directly from database
            User user = userServiceImpl.findById(userId);
            if (user == null) {
                return new ResponseEntity<>("User not found with id: " + userId,
                        HttpStatus.NOT_FOUND);
            }

            // Create the post
            Post post = new Post();
            post.setTitle(title);
            post.setContent(content);
            post.setAuthor(user);
            post.setDate(LocalDateTime.now());
            post.setRoom(room);

            Post savedPost = postService.savePost(post);
            return new ResponseEntity<>(savedPost, HttpStatus.CREATED);

        } catch (Exception e) {
            System.err.println("Error creating test post: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Internal server error: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<String> createPost(@RequestBody Map<String, Object> request) {
        try {

            // System.out.println("Received request: " + request); // Debug log
            // User user = (User) session.getAttribute("user");
            // System.out.println("Session user: " + user); // Debug log

            // if (user == null) {
            // return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
            // }

            // if (user.getUserRole() != UserRole.REG) {
            // return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);
            // }

            // // Extract data from request
            // String title = (String) request.get("title");
            // String content = (String) request.get("content");
            // Integer roomId = (Integer) request.get("roomId");

            // if (title == null || content == null || roomId == null) {
            // return new ResponseEntity<>("Missing required fields",
            // HttpStatus.BAD_REQUEST);
            // }

            // // Find the room
            // Room room = roomServiceImpl.findRoomById(roomId);
            // if (room == null) {
            // return new ResponseEntity<>("Room not found", HttpStatus.NOT_FOUND);
            // }

            // // Create the post
            // Post post = new Post();
            // post.setTitle(title);
            // post.setContent(content);
            // post.setAuthor(user);
            // post.setDate(LocalDateTime.now());
            // post.setRoom(room);

            // Post savedPost = postService.savePost(post);
            return new ResponseEntity<String>("Post created successfully", HttpStatus.CREATED);

        } catch (Exception e) {
            System.err.println("Error creating post: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<String>("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable int id, @RequestBody Post postDetails) {
        Post post = postService.findPostById(id);
        post.setDate(postDetails.getDate());
        post.setAuthor(postDetails.getAuthor());
        Post updatedPost = postService.updatePost(post);
        return new ResponseEntity<>(updatedPost, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(@PathVariable int id) {
        postService.deletePostById(id);
        return new ResponseEntity<>("Post with ID " + id + " deleted.", HttpStatus.NO_CONTENT);
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<Post>> getPostsByRoom(@PathVariable int roomId) {
        var posts = postService.findByRoomId(roomId);
        return posts.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(posts);
    }
}