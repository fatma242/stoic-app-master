package com.example.stoic.Room.Repo;

import com.example.stoic.Room.Model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepo extends JpaRepository<Room, Integer> {
    @Query("SELECT r FROM Room r WHERE r.type = 'PUBLIC'")
    List<Room> findAllPubRooms();
    
    @Query("SELECT DISTINCT r FROM Room r LEFT JOIN FETCH r.Users WHERE r.type = 'PUBLIC'")
    List<Room> findAllPublicRoomsWithUsers();
    
    @Query("SELECT DISTINCT r FROM Room r LEFT JOIN FETCH r.Users " +
           "WHERE r.type = 'PUBLIC' OR " +
           "(r.type = 'PRIVATE' AND (r.ownerId = :userId OR :userId IN (SELECT u.userId FROM r.Users u)))")
    List<Room> findVisibleRoomsForUser(@Param("userId") int userId);
}