package com.example.stoic.Comment.Service;

import com.example.stoic.Comment.Model.Comment;
import com.example.stoic.Post.Model.Post;
import com.example.stoic.User.Model.User;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

public interface commentservice {
    List<Comment> getCommentsByPostId(int id);

    Comment CreateComment(Comment comment);

    Comment getComment(int id);

    void deleteByCommentId(int id);

}