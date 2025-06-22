package com.example.stoic.Room.Service;

import com.example.stoic.Room.Model.Room;

import java.util.List;

public interface RoomService {

    List<Room> findAllRooms();
    List<Room> findAllPubRooms();

    Room findRoomById(int id);

    Room createRoom(Room room);

    void deleteRoomById(int id);

    void SendRequest(int userId);

    // void HandleReq();
}