package com.example.stoic.Room.Service;

import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.Repo.RoomRepo;
import com.example.stoic.Room.dto.RoomDTO;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Repo.UserRepo;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepo roomRepo;
    private final UserRepo userRepo;

    public RoomServiceImpl(RoomRepo roomRepo, UserRepo userRepo) {
        this.roomRepo = roomRepo;
        this.userRepo = userRepo;
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
    public List<User> findUsersByRoomId(int id) {
        try {
            return roomRepo.findUsersByRoomId(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch users by room id: " + id, e);
        }
    }

    @Transactional
    public void deleteRoom(int roomId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));
        roomRepo.delete(room);
        // because of CascadeType.ALL + orphanRemoval, all posts will be removed too
    }

    @Override
    public void removeUserFromRoom(int userId, int roomId) {
        try {
            Room room = roomRepo.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            room.removeUser(user);
            System.out.println("User removed from room successfully");
            roomRepo.save(room);

        } catch (Exception e) {
            System.err.println("Error removing user from room: " + e.getMessage());
            throw new RuntimeException("Failed to remove user from room", e);
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
    public List<RoomDTO> findRoomsForNonOwnerUser(int userId) {
        List<Room> rooms = roomRepo.findRoomsForNonOwnerUser(userId);
        return rooms.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<RoomDTO> findOwnerRooms(int userId) {
        List<Room> rooms = roomRepo.findOwnerRooms(userId);
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

    @Override
    public Void joinRoom(User user, String join_code) {
        try {

            Room room = roomRepo.findRoomByjoin_code(join_code);
            if (room == null) {
                throw new RuntimeException("Room not found with join code: " + join_code);
            }
            room.adduser(user); // Assuming adduser method is defined in Room class
            roomRepo.save(room); // Save the updated room with the new user
            // Logic to add user to the room
            // For example, you might want to add the user to the room's Users list
            // room.getUsers().add(user);
            // roomRepo.save(room);
        } catch (Exception e) {
            throw new RuntimeException("Failed to join room with join code: " + join_code, e);
        }
        return null;
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