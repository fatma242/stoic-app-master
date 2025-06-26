package com.example.stoic.Comment.Controller;

import com.example.stoic.Comment.Model.Comment;
import com.example.stoic.Comment.Repo.CommentRepo;
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
        "${ALLOWED_ORIGIN}",
        "http://192.168.1.19:8100",
        "${expo_url}"
}, allowCredentials = "true")
@RestController
@RequestMapping("/api/Comments")
public class CommentController {
    private final PostServiceImpl PostServiceImpl;
    private final commentserviceimpl commentserviceimpl;
    private final CommentRepo commentRepo;

    public CommentController(commentserviceimpl commentserviceimpl, PostServiceImpl PostServiceImpl,
            CommentRepo commentRepo) {
        this.commentserviceimpl = commentserviceimpl;
        this.PostServiceImpl = PostServiceImpl;
        this.commentRepo = commentRepo;
    }

    @GetMapping("/comments/{id}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable int id) {
        List<Comment> comments = commentserviceimpl.getCommentsByPostId(id);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    @PutMapping("likes/{id}")
    public int postLikes(@PathVariable int id, HttpSession session) {
        try {
            User user = (User) session.getAttribute("user");
            if (user == null) {
                return -1; // Unauthorized
            }
            Comment comment = commentserviceimpl.getComment(id);
            if (comment == null) {
                return -2; // Post not found
            }
            User Temp = user;
            // Check if user already liked the post
            boolean alreadyLiked = comment.Getlikes(user);
            System.out.println("User " + user.getUsername() + " already liked post: " + alreadyLiked);
            if (alreadyLiked) {
                // Unlike the post
                System.out.println("User " + user.getUsername() + " is unliking post with ID: " + id);
                commentRepo.deleteLike(id, user.getUserId());
                // comment.getLikes().removeIf(u -> u.getUserId() == user.getUserId());

            } else {
                System.out.println("User " + user.getUsername() + " is liking post with ID: " + id);
                // Like the post
                comment.getLikes().add(user);
            }
            Comment savedcomment = commentRepo.save(comment);

            // Return the updated post data
            return savedcomment.getLikes().size(); // Return the number of likes
        } catch (Exception e) {
            return -3; // Internal server error
        }
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

    @PutMapping("/Report")
    public ResponseEntity<?> reportComment(@RequestBody Map<String, Object> request) {
        try {
            Integer commentID = (Integer) request.get("commentID");
            if (commentID == null) {
                return new ResponseEntity<>("Missing required fields", HttpStatus.BAD_REQUEST);
            }
            Comment comment = commentserviceimpl.getComment(commentID);
            if (comment == null) {
                return new ResponseEntity<>("Comment not found", HttpStatus.NOT_FOUND);
            }
            int reports = comment.getReport() + 1;
            comment.setReport(reports);

            if (reports >= 10) {
                commentserviceimpl.deleteByCommentId(commentID);
                return new ResponseEntity<>("Comment deleted due to reports", HttpStatus.OK);
            } else {
                commentserviceimpl.CreateComment(comment); // Make sure you have a save method
                return new ResponseEntity<>("Report count incremented", HttpStatus.OK);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Internal server error: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}
