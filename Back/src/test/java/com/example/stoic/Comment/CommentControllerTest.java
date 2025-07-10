package com.example.stoic.Comment;

import com.example.stoic.Comment.Controller.CommentController;
import com.example.stoic.Comment.Model.Comment;
import com.example.stoic.Comment.Service.commentserviceimpl;
import com.example.stoic.Notification.Model.NotificationType;
import com.example.stoic.Notification.Service.NotificationService;
import com.example.stoic.Post.Model.Post;
import com.example.stoic.Post.Service.PostServiceImpl;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Model.UserRole;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CommentController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private commentserviceimpl commentService;

    @MockBean
    private PostServiceImpl postService;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private com.example.stoic.Comment.Repo.CommentRepo commentRepo;

    @Autowired
    private ObjectMapper objectMapper;

    private MockHttpSession session;
    private User user;
    private Post samplePost;
    private Comment sampleComment;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1);
        user.setUsername("tester");
        user.setUserRole(UserRole.REG);

        session = new MockHttpSession();
        session.setAttribute("user", user);

        samplePost = new Post();
        samplePost.setId(50);

        sampleComment = new Comment();
        sampleComment.setId(200);
        sampleComment.setContent("Great!");
        sampleComment.setAuthor(user);
        sampleComment.setPost(samplePost);
        sampleComment.setDate(LocalDateTime.now());
        sampleComment.setReport(0);
    }

    @Test
    void likeComment_unauthorized_returnsMinusOne() throws Exception {
        mockMvc.perform(put("/api/Comments/likes/200"))
                .andExpect(status().isOk())
                .andExpect(content().string("-1"));
    }

    @Test
    void createComment_missingFields() throws Exception {
        mockMvc.perform(post("/api/Comments/comments/create")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Missing required fields"));
    }

    @Test
    void createComment_success() throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("content", "Awesome");
        req.put("postId", 50);
        Mockito.when(postService.findPostById(50)).thenReturn(samplePost);
        Mockito.when(commentService.CreateComment(any(Comment.class))).thenReturn(sampleComment);

        mockMvc.perform(post("/api/Comments/comments/create")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
        // .andExpect(jsonPath("$.commentId", is(200)));
    }

    @Test
    void reportComment_missingFields() throws Exception {
        mockMvc.perform(put("/api/Comments/Report")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Missing required fields"));
    }

    @Test
    void reportComment_notFound() throws Exception {
        Map<String, Object> req = Map.of("commentID", 999);
        Mockito.when(commentService.getComment(999)).thenReturn(null);

        mockMvc.perform(put("/api/Comments/Report")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Comment not found"));
    }

    @Test
    void reportComment_deleteAfterThreshold() throws Exception {
        Map<String, Object> req = Map.of("commentID", 200);
        sampleComment.setReport(10);
        Mockito.when(commentService.getComment(200)).thenReturn(sampleComment);
        Mockito.doNothing().when(commentService).deleteByCommentId(200);

        mockMvc.perform(put("/api/Comments/Report")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(content().string("Comment deleted due to reports"));
    }
}
