package com.example.stoic.Comment.Repo;

import com.example.stoic.Comment.Model.Comment;
import com.example.stoic.Post.Model.Post;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepo extends JpaRepository<Comment, Integer> {
    // Add custom query methods if needed
    @Query("SELECT u FROM Comment u WHERE u.post.id = :id ORDER BY u.date ASC")
    List<Comment> getCommentsByPostId(int id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM comment_likes WHERE comment_id = :commentId AND user_id = :userId", nativeQuery = true)
    void deleteLike(
            @Param("commentId") int commentId,
            @Param("userId") int userId);
}