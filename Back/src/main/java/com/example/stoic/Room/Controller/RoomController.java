package com.example.stoic.Room.Controller;

import com.example.stoic.Post.Model.Post;
import com.example.stoic.Post.Repo.PostRepo;
import com.example.stoic.Post.Service.PostServiceImpl;
import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.Model.RoomType;
import com.example.stoic.Room.Repo.RoomRepo;
import com.example.stoic.Room.Service.RoomService;
import com.example.stoic.Room.Service.RoomServiceImpl;
import com.example.stoic.Room.dto.RoomDTO;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Model.UserRole;
import com.example.stoic.User.Service.UserServiceImpl;

import jakarta.servlet.http.HttpSession;

import org.checkerframework.checker.units.qual.s;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@CrossOrigin(origins = {
        "http://192.168.1.19:8081",
        "exp://192.168.1.19:8081"
}, allowCredentials = "true")
@RestController
@RequestMapping("/rooms")
public class RoomController {

    private final RoomService roomService;
    private final PostRepo postRepo;

    public RoomController(RoomService roomService, PostRepo postRepo) {
        this.roomService = roomService;
        this.postRepo = postRepo;
    }

    @GetMapping("/")
    public String index() {
        return "redirect:/index.html";
    }

    @GetMapping("/data")
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomService.findAllRooms();
        return new ResponseEntity<>(rooms, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable int id) {
        Room room = roomService.findRoomById(id);
        return new ResponseEntity<>(room, HttpStatus.OK);
    }

    @GetMapping("/getPub")
    public ResponseEntity<List<Room>> getpubRoom() {
        List<Room> rooms = roomService.findAllPubRooms();
        return new ResponseEntity<>(rooms, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Room room, HttpSession session) {
        User user = (User) session.getAttribute("user");
        // Debug logging
        // System.out.println("POST rooms: user=" + user + ", payload=" + room);

        if (user == null)
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        if (user.getUserRole() != UserRole.ADMIN)
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);

        // Default missing fields
        room.setOwnerId(user.getUserId()); // ensure ID
        room.setCreatedAt(new Date());
        room.setType(RoomType.PUBLIC);
        room.setUsers(uServiceImpl.findAll());
        Room saved = roomService.createRoom(room);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/createPR")
    public ResponseEntity<?> createPrivateRoom(@RequestBody Room room, HttpSession session) {
        User user = (User) session.getAttribute("user");
        // System.out.println(user);
        if (user == null)
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        if (user.getUserRole() != UserRole.REG)
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);

        // Default missing fields
        room.setOwnerId(user.getUserId()); // ensure ID
        room.setCreatedAt(new Date());
        room.setType(RoomType.PRIVATE);
        // room.getUsers().add(user);
        room.adduser(user); // Add the user to the room
        // room.setUsers(room.getUsers()); // Add the user to the room
        Room saved = roomService.createRoom(room);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/createPR/{id}")
    public ResponseEntity<?> createPrivateRoomWeb(@RequestBody Room room, HttpSession session, @PathVariable int id) {
        User user = uServiceImpl.findById(id);
        // System.out.println(user);
        if (user == null)
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        if (user.getUserRole() != UserRole.REG)
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);

        // Default missing fields
        room.setOwnerId(user.getUserId()); // ensure ID
        room.setCreatedAt(new Date());
        room.setType(RoomType.PRIVATE);
        // room.getUsers().add(user);
        room.adduser(user); // Add the user to the room
        // room.setUsers(room.getUsers()); // Add the user to the room
        Room saved = roomService.createRoom(room);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/joinPR")
    public ResponseEntity<?> joinPrivateRoom(@RequestParam String joinCode, HttpSession session) {
        User user = (User) session.getAttribute("user");
        // System.out.println(user);
        if (user == null)
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        if (user.getUserRole() != UserRole.REG)
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);

        // Join the room
        roomService.joinRoom(user, joinCode);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsersByRoomId(@RequestParam int roomId) {
        List<User> users = roomService.findUsersByRoomId(roomId);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @PutMapping("likes/{id}")
    public int postLikes(@PathVariable int id, HttpSession session) {
        try {
            User user = (User) session.getAttribute("user");
            if (user == null) {
                return -1; // Unauthorized
            }

            Post post = postRepo.findByid(id);
            if (post == null) {
                return -2; // Post not found
            }

            // Check if user already liked the post
            boolean alreadyLiked = post.getLikes().contains(user);

            if (alreadyLiked) {
                // Unlike the post
                post.getLikes().remove(user);
            } else {
                // Like the post
                post.getLikes().add(user);
            }

            Post savedPost = postRepo.save(post);

            // Return the updated post data
            return savedPost.getLikes().size(); // Return the number of likes

        } catch (Exception e) {
            return -3; // Internal server error
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable int id, @RequestBody Room roomDetails) {
        Room room = roomService.findRoomById(id);
        room.setType(roomDetails.getType());
        room.setOwnerId(roomDetails.getOwnerId());
        Room updatedRoom = roomService.createRoom(room);
        return new ResponseEntity<>(updatedRoom, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable int id) {
        roomService.deleteRoomById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/visible")
    public ResponseEntity<List<RoomDTO>> getVisibleRooms(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        try {
            if (user.getUserRole() == UserRole.ADMIN) {
                List<RoomDTO> rooms = roomService.findAllPublicRoomsWithUsers();
                return new ResponseEntity<>(rooms, HttpStatus.OK);
            } else {
                List<RoomDTO> rooms = roomService.findRoomsForNonOwnerUser(user.getUserId());
                return new ResponseEntity<>(rooms, HttpStatus.OK);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/visible/owner")
    public ResponseEntity<List<RoomDTO>> getVisibleOwnerRooms(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        try {
            if (user.getUserRole() == UserRole.ADMIN) {
                List<RoomDTO> rooms = roomService.findAllPublicRoomsWithUsers();
                return new ResponseEntity<>(rooms, HttpStatus.OK);
            } else {
                List<RoomDTO> rooms = roomService.findOwnerRooms(user.getUserId());
                return new ResponseEntity<>(rooms, HttpStatus.OK);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- POSTS CONTROLLER LOGIC SHARING SAME CORS AND BASE PATH ---

    @RestController
    @RequestMapping("/rooms") // Shares the same CORS and base path as RoomController
    @CrossOrigin(origins = {
            "http://192.168.1.19:8081",
            "exp://192.168.1.19:8081"
    }, allowCredentials = "true")
    class PostsController {

        private final PostServiceImpl postService;
        private final RoomServiceImpl roomServiceImpl;
        private final UserServiceImpl userServiceImpl;

        public PostsController(PostServiceImpl postService, RoomServiceImpl roomServiceImpl,
                UserServiceImpl userServiceImpl) {
            this.postService = postService;
            this.roomServiceImpl = roomServiceImpl;
            this.userServiceImpl = userServiceImpl;
        }

        @GetMapping("/posts")
        public ResponseEntity<List<Post>> getAllPosts() {
            List<Post> posts = postService.findAllPosts();
            return new ResponseEntity<>(posts, HttpStatus.OK);
        }

        @GetMapping("/posts/{id}")
        public ResponseEntity<Post> getPostById(@PathVariable int id) {
            Post post = postService.findPostById(id);
            return new ResponseEntity<>(post, HttpStatus.OK);
        }

        @GetMapping("/posts/room/{roomId}")
        public ResponseEntity<List<Post>> getPostsByRoom(@PathVariable int roomId) {
            var posts = postService.findByRoomId(roomId);
            return posts.isEmpty()
                    ? ResponseEntity.noContent().build()
                    : ResponseEntity.ok(posts);
        }

        @PostMapping("/posts/create")
        public ResponseEntity<?> createPost(@RequestBody Map<String, Object> request, HttpSession session) {
            try {
                User user = (User) session.getAttribute("user");
                if (user == null) {
                    return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
                }

                String title = (String) request.get("title");
                String content = (String) request.get("content");
                Integer roomId = (Integer) request.get("roomId");

                if (title == null || content == null || roomId == null) {
                    return new ResponseEntity<>("Missing required fields", HttpStatus.BAD_REQUEST);
                }

                Room room = roomServiceImpl.findRoomById(roomId);
                if (room == null) {
                    return new ResponseEntity<>("Room not found", HttpStatus.NOT_FOUND);
                }

                Post post = new Post();
                post.setTitle(title);
                post.setContent(content);
                System.out.println("Creating post with title: " + title + ", content: " + content);
                System.out.println("User: " + user.getUsername() + ", Room ID: " + roomId);
                post.setAuthor(user);
                post.setDate(LocalDateTime.now());
                post.setRoom(room);

                Post savedPost = postService.savePost(post);
                return new ResponseEntity<>(savedPost, HttpStatus.CREATED);

            } catch (Exception e) {
                return new ResponseEntity<>("Internal server error: " + e.getMessage(),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        @PutMapping("/posts/{id}")
        public ResponseEntity<Post> updatePost(@PathVariable int id, @RequestBody Post postDetails) {
            Post post = postService.findPostById(id);
            post.setDate(postDetails.getDate());
            post.setAuthor(postDetails.getAuthor());
            Post updatedPost = postService.updatePost(post);
            return new ResponseEntity<>(updatedPost, HttpStatus.OK);
        }

        @DeleteMapping("/posts/{id}")
        public ResponseEntity<String> deletePost(@PathVariable int id) {
            postService.deletePostById(id);
            return new ResponseEntity<>("Post with ID " + id + " deleted.", HttpStatus.NO_CONTENT);
        }
    }

}
