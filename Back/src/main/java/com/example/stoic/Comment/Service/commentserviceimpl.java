package com.example.stoic.Comment.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.stoic.Comment.Model.Comment;
import com.example.stoic.Comment.Repo.CommentRepo;
import com.example.stoic.Post.Model.Post;
import com.example.stoic.Post.Repo.PostRepo;
import com.example.stoic.Room.Model.Room;

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

    @Override
    public Comment getComment(int id) {
        try {
            Optional<Comment> comment = commentRepo.findById(id);
            if (comment.isPresent()) {
                return comment.get();
            } else {
                throw new RuntimeException("Room not found with id: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch room by id: " + id, e);
        }
    }

    @Override
    public void deleteByCommentId(int id) {
        try {
            commentRepo.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete room by id: " + id, e);
        }
    }
}
