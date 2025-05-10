package com.example.stoic.Room.Service;

import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.Repo.RoomRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepo roomRepo;

    public RoomServiceImpl(RoomRepo roomRepo) {
        this.roomRepo = roomRepo;
    }

    @Override
    public List<Room> findAllRooms() {
        try {
            return roomRepo.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch all rooms", e);
        }
    }

    @Override
    public Room findRoomById(int id) {
        try {
            Optional<Room> room = roomRepo.findById(id);
            if (room.isPresent()) {
                return room.get();
            } else {
                throw new RuntimeException("Room not found with id: " + id);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch room by id: " + id, e);
        }
    }

    @Override
    public Room createRoom(Room room) {
        try {
            return roomRepo.save(room);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save room", e);
        }
    }

    @Override
    public void deleteRoomById(int id) {
        try {
            roomRepo.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete room by id: " + id, e);
        }
    }

    @Override
    public void SendRequest(int userId) {
        try {
            // logic
        } catch (Exception e) {
            throw new RuntimeException("Failed to send request for user id: " + userId, e);
        }
    }

    // @Override
    // public void HandleReq() {
    // try {
    // roomRepo.acceptReq();
    // } catch (Exception e) {
    // throw new RuntimeException("Failed to handle request", e);
    // }

    // }
}