package com.example.stoic.Room.Controller;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.stoic.Post.Model.Post;
import com.example.stoic.Post.Service.PostServiceImpl;
import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.Model.RoomType;
import com.example.stoic.Room.Service.RoomService;
import com.example.stoic.Room.Service.RoomServiceImpl;
import com.example.stoic.Room.dto.RoomDTO;
import com.example.stoic.User.Model.User; // ✅ <-- ADDED THIS IMPORT
import com.example.stoic.User.Model.UserRole;
import com.example.stoic.User.Service.UserServiceImpl;

import jakarta.servlet.http.HttpSession;

@CrossOrigin(origins = {
        "http://192.168.1.6:8081",
        "http://192.168.20.179:8081",
        "exp://192.168.20.179:8081",
        "exp://192.168.1.6:8081",
        "exp://192.168.210.193:8081",
        "http://localhost:8081",
}, allowCredentials = "true")
@RestController
@RequestMapping("/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
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
        System.out.println("POST rooms: user=" + user + ", payload=" + room);

        if (user == null)
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        if (user.getUserRole() != UserRole.ADMIN)
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);

        room.setOwnerId(user.getUserId());
        room.setCreatedAt(new Date());
        room.setType(RoomType.PUBLIC);
        Room saved = roomService.createRoom(room);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/createPR")
    public ResponseEntity<?> createPrivateRoom(@RequestBody Room room, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null)
            return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
        if (user.getUserRole() != UserRole.REG)
            return new ResponseEntity<>("Forbidden", HttpStatus.FORBIDDEN);

        room.setOwnerId(user.getUserId());
        room.setCreatedAt(new Date());
        room.setType(RoomType.PRIVATE);
        Room saved = roomService.createRoom(room);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
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
                List<RoomDTO> rooms = roomService.findVisibleRoomsForUser(user.getUserId());
                return new ResponseEntity<>(rooms, HttpStatus.OK);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RestController
    @RequestMapping("/rooms") 
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
                post.setLikes(0);
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
