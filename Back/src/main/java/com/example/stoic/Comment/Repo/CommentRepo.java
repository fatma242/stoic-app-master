package com.example.stoic.Comment.Repo;

import com.example.stoic.Comment.Model.Comment;
import com.example.stoic.Post.Model.Post;

import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepo extends JpaRepository<Comment, Integer> {
    // Add custom query methods if needed
    @Query("SELECT u FROM Comment u WHERE u.post.id = :id ORDER BY u.date ASC")
    List<Comment> getCommentsByPostId(int id);
}