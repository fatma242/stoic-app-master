package com.example.stoic.Comment.Repo;

import com.example.stoic.Comment.Model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepo extends JpaRepository<Comment, Long> {
    // Add custom query methods if needed
}