package com.example.stoic.Room.Repo;

import com.example.stoic.Room.Model.Room;
import com.example.stoic.User.Model.User;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
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
                        "WHERE " +
                        "(r.type = 'PRIVATE' AND (r.ownerId = :userId ))")
        List<Room> findOwnerRooms(@Param("userId") int userId);

        @Query("SELECT DISTINCT r FROM Room r LEFT JOIN FETCH r.Users " +
                        "WHERE r.type = 'PUBLIC' OR " +
                        "(r.type = 'PRIVATE' AND (r.ownerId = :userId OR :userId IN (SELECT u.userId FROM r.Users u)))")
        List<Room> findVisibleRoomsForUser(@Param("userId") int userId);

        @Query("SELECT DISTINCT r FROM Room r LEFT JOIN FETCH r.Users " +
                        "WHERE  " +
                        "(r.type = 'PRIVATE' AND :userId IN (SELECT u.userId FROM r.Users u) AND r.ownerId != :userId)")
        List<Room> findRoomsForNonOwnerUser(@Param("userId") int userId);

        @Query("SELECT r FROM Room r WHERE r.join_code = :join_code")

        Room findRoomByjoin_code(@Param("join_code") String join_code);

        @Query("select u from Room r join r.Users u where r.roomId = :id")
        List<User> findUsersByRoomId(@Param("id") int id);

        @Query("delete from Room r where r.roomId = :id")
        void deleteByRoomId(@Param("id") int id);

        @Modifying
        @Transactional
        @Query(value = "delete from user_rooms r where r.room_id = :room_id and r.user_id = :user_id", nativeQuery = true)
        void deleteUserFromRoom(@Param("user_id") int user_id, @Param("room_id") int room_id);

        @Modifying
        @Transactional
        @Query(value = "delete from posts p where p.id = :PostId", nativeQuery = true)
        void PostForceDelete(@Param("PostId") int PostId);

        @Modifying
        @Transactional
        @Query(value = "delete from post p where p.id = :PostId and p.user_id = :userId", nativeQuery = true)
        void PostDelete(@Param("PostId") int PostId, @Param("userId") int userId);

        // @Query(value = "select case when count(u) > 0 then true else false end from user_rooms ur join ur.user u where u.id = :userId and ur.room.id = :roomId", nativeQuery = true)
        // Boolean checkuserinroom (@Param("userId") int userId, @Param("roomId") int roomId);
        // @Query("select u from User u where u.id= (select r.userId from User_rooms r where r.roomId = :roomId)")
        // List<User> getAllUsersInRoom(@Param("roomId") int roomId);
      
}


// @Query("select u from User u where (select r.user_id from user_rooms r where
// r.id = :id)=u.id")
