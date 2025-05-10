package com.example.stoic.Post.Service;

import com.example.stoic.Post.Model.Post;

import java.util.List;

public interface PostService {

    List<Post> findAllPosts();

    Post findPostById(int id);

    Post savePost(Post post);

    void deletePostById(int id);

    Post updatePost(Post post);
}
