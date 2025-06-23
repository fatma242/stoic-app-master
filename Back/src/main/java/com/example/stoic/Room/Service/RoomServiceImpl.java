package com.example.stoic.Room.Service;

import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.Repo.RoomRepo;
import com.example.stoic.Room.dto.RoomDTO;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
    public List<Room> findAllPubRooms() {
        try {
            return roomRepo.findAllPubRooms();
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

    @Override
    public List<RoomDTO> findVisibleRoomsForUser(int userId) {
        List<Room> rooms = roomRepo.findVisibleRoomsForUser(userId);
        return rooms.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<RoomDTO> findAllPublicRoomsWithUsers() {
        List<Room> rooms = roomRepo.findAllPublicRoomsWithUsers();
        return rooms.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private RoomDTO convertToDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setRoomId(room.getRoomId());
        dto.setOwnerId(room.getOwnerId());
        dto.setRoomName(room.getRoomName());
        dto.setType(room.getType());
        dto.setCreatedAt(room.getCreatedAt());
        return dto;
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