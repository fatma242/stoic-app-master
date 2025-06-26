package com.example.stoic.Comment.Controller;

import com.example.stoic.Comment.Model.Comment;
import com.example.stoic.Comment.Service.commentserviceimpl;
import com.example.stoic.Post.Model.Post;
import com.example.stoic.Post.Repo.PostRepo;
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
import java.util.Optional;

import jakarta.servlet.http.HttpSession;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Model.UserRole;
import com.example.stoic.User.Service.UserServiceImpl;

@CrossOrigin(origins = {
        "http://192.168.1.19:8081",
        "http://192.168.1.19:8100",
        "exp://192.168.1.19:8081"
}, allowCredentials = "true")
@RestController
@RequestMapping("/api/Comments")
public class CommentController {
    private final PostServiceImpl PostServiceImpl;
    private final commentserviceimpl commentserviceimpl;

    public CommentController(commentserviceimpl commentserviceimpl, PostServiceImpl PostServiceImpl) {
        this.commentserviceimpl = commentserviceimpl;
        this.PostServiceImpl = PostServiceImpl;
    }

    @GetMapping("/comments/{id}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable int id) {
        List<Comment> comments = commentserviceimpl.getCommentsByPostId(id);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    @PostMapping("/comments/create")
    public ResponseEntity<?> createComment(@RequestBody Map<String, Object> request, HttpSession session) {
        try {
            User user = (User) session.getAttribute("user");
            if (user == null) {
                return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
            }
            String content = (String) request.get("content");
            Integer postId = (Integer) request.get("postId");
            if (content == null || postId == null) {
                return new ResponseEntity<>("Missing required fields", HttpStatus.BAD_REQUEST);
            }
            Post post = PostServiceImpl.findPostById(postId);
            Comment comment = new Comment();
            comment.setPost(post);
            comment.setAuthor(user);
            comment.setDate(LocalDateTime.now());
            comment.setContent(content);
            comment.setReport(0);
            Comment savedComment = commentserviceimpl.CreateComment(comment);
            return new ResponseEntity<>(savedComment, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Internal server error: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}