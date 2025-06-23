package com.example.stoic.Room.Service;

import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.dto.RoomDTO;

import java.util.List;

public interface RoomService {

    List<Room> findAllRooms();
    List<Room> findAllPubRooms();

    Room findRoomById(int id);

    Room createRoom(Room room);

    void deleteRoomById(int id);

    void SendRequest(int userId);

    List<RoomDTO> findVisibleRoomsForUser(int userId);
    List<RoomDTO> findAllPublicRoomsWithUsers();

    // void HandleReq();
}