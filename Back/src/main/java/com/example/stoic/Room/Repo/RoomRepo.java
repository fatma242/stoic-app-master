package com.example.stoic.Room.Repo;

import com.example.stoic.Room.Model.Room;
import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.*;
import com.example.stoic.Notification.Model.Notification;

@Repository
public interface RoomRepo extends JpaRepository<Room, Integer>, JpaSpecificationExecutor<Room> {
    // @Query("SELECT * FROM notification, User WHERE id = ?1")
    // List<Notification> findNotificationsByUserId(int userId);
    @Query("SELECT * FROM Room WHERE type = 'PUBLIC'")
    List<Room> findAllPubRooms();
    

}