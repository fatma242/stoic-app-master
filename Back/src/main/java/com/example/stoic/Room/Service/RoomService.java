package com.example.stoic.Room.Service;

import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.dto.RoomDTO;
import com.example.stoic.User.Model.User;

import java.util.List;

public interface RoomService {

    List<Room> findAllRooms();

    List<Room> findAllPubRooms();

    Room findRoomById(int id);

    Room createRoom(Room room);

    List<RoomDTO> findRoomsForNonOwnerUser(int userId);

    List<RoomDTO> findOwnerRooms(int userId);

    void deleteRoomById(int id);

    void SendRequest(int userId);

    List<RoomDTO> findVisibleRoomsForUser(int userId);

    List<RoomDTO> findAllPublicRoomsWithUsers();

    Void joinRoom(User user, String join_code);

    List<User> findUsersByRoomId(int id);

    // void HandleReq();
}