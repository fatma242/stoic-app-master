package com.example.stoic.Room.Controller;

import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.Model.RoomType;
import com.example.stoic.Room.Service.RoomService;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Model.UserRole;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://192.168.1.6:8081")
@RestController
@RequestMapping("/rooms") // localhost:8080/rooms
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/")
    public String index() {
        return "redirect:/index.html";
    }

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/data")
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomService.findAllRooms();
        return new ResponseEntity<>(rooms, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable int id) {
        Room room = roomService.findRoomById(id);
        return new ResponseEntity<>(room, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        Room newRoom = roomService.createRoom(room);
        return new ResponseEntity<>(newRoom, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable int id, @RequestBody Room roomDetails) {
        Room room = roomService.findRoomById(id);
        room.setType(roomDetails.getType());
        room.setOwnerId(roomDetails.getOwnerId());
        Room updatedRoom = roomService.createRoom(room);
        return new ResponseEntity<>(updatedRoom, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable int id) {
        roomService.deleteRoomById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/visible")
    public ResponseEntity<List<Room>> getVisibleRooms(HttpSession session) {
        User user = (User) session.getAttribute("user");

        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        List<Room> allRooms = roomService.findAllRooms();

        // Admins and moderators see all rooms
        if (user.getUserRole() == UserRole.ADMIN || user.getUserRole() == UserRole.MOD) {
            return new ResponseEntity<>(allRooms, HttpStatus.OK);
        }

        // Regular users see only PUBLIC rooms
        List<Room> visibleRooms = allRooms.stream()
            .filter(room -> room.getType() == RoomType.PUBLIC)
            .toList();

        return new ResponseEntity<>(visibleRooms, HttpStatus.OK);
    }

}