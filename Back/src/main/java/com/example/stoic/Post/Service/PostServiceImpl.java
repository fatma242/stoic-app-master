package com.example.stoic.Post.Service;

import com.example.stoic.Post.Model.Post;
import com.example.stoic.Post.Repo.PostRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostServiceImpl implements PostService {

    private final PostRepo postRepo;

    public PostServiceImpl(PostRepo postRepo) {
        this.postRepo = postRepo;
    }

    @Override
    public List<Post> findAllPosts() {
        return postRepo.findAll();
    }

    @Override
    public Post findPostById(int id) {
        Optional<Post> post = postRepo.findById(id);
        return post.orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
    }

    @Override
    public List<Post> findByRoomId(int roomId) {
        List<Post> post = postRepo.findByRoomRoomId(roomId);
        return post;
    }

    @Override
    public Post savePost(Post post) {
        return postRepo.save(post);
    }

    @Override
    public void deletePostById(int id) {
        postRepo.deleteById(id);
    }

    @Override
    public Post updatePost(Post post) {
        if (postRepo.existsById(post.getId())) {
            return postRepo.save(post);
        } else {
            throw new RuntimeException("Post not found with id: " + post.getId());
        }
    }

}