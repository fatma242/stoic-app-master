package com.example.stoic.Comment.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.stoic.Comment.Model.Comment;
import com.example.stoic.Comment.Repo.CommentRepo;
import com.example.stoic.Post.Model.Post;
import com.example.stoic.Post.Repo.PostRepo;

@Service
public class commentserviceimpl implements commentservice {
    private final CommentRepo commentRepo;

    public commentserviceimpl(CommentRepo commentRepo) {
        this.commentRepo = commentRepo;
    }

    @Override
    public Comment CreateComment(Comment comment) {
        return commentRepo.save(comment);
    }

    @Override
    public List<Comment> getCommentsByPostId(int id) {
        return commentRepo.getCommentsByPostId(id);
    }
}
