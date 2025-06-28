package com.example.stoic.Post.Repo;

import com.example.stoic.Post.Model.Post;


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
public interface PostRepo extends JpaRepository<Post, Integer>, JpaSpecificationExecutor<Post> {
    // @Query("SELECT r FROM Post r WHERE r.room_id =")
    List<Post> findByRoomRoomId(int roomId);

    Post findByid(int postId);

    @Modifying
    @Transactional
    @Query(
      value = "DELETE FROM post_likes WHERE post_id = :postId AND user_id = :userId",
      nativeQuery = true
    )
    void deleteLike(
      @Param("postId") int postId,
      @Param("userId") int userId
    );

}
