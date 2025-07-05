package com.example.stoic.Room;

import com.example.stoic.Notification.Service.NotificationService;
import com.example.stoic.Post.Repo.PostRepo;
import com.example.stoic.Room.Controller.RoomController;
import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.Model.RoomType;
import com.example.stoic.Room.Service.RoomServiceImpl;
import com.example.stoic.Room.dto.RoomDTO;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Model.UserRole;
import com.example.stoic.User.Service.UserServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = RoomController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RoomServiceImpl roomService;

    @MockBean
    private PostRepo postRepo;

    @MockBean
    private UserServiceImpl userService;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private com.example.stoic.Post.Service.PostServiceImpl postService;

    @Autowired
    private ObjectMapper objectMapper;

    private Room sampleRoom;
    private User adminUser;
    private User regularUser;
    private RoomDTO sampleRoomDTO;
    private MockHttpSession mockSession;

    @BeforeEach
    void setUp() {
        // Setup admin user
        adminUser = new User();
        adminUser.setUserId(1);
        adminUser.setUsername("admin");
        adminUser.setEmail("admin@example.com");
        adminUser.setUserRole(UserRole.ADMIN);

        // Setup regular user
        regularUser = new User();
        regularUser.setUserId(2);
        regularUser.setUsername("user");
        regularUser.setEmail("user@example.com");
        regularUser.setUserRole(UserRole.REG);

        // Setup sample room
        sampleRoom = new Room();
        sampleRoom.setRoomId(1);
        sampleRoom.setRoomName("Test Room");
        sampleRoom.setType(RoomType.PUBLIC);
        sampleRoom.setOwnerId(1);
        sampleRoom.setCreatedAt(new Date());
        sampleRoom.setJoin_code("ABC123");

        // Setup sample room DTO
        sampleRoomDTO = new RoomDTO();
        sampleRoomDTO.setRoomId(1);
        sampleRoomDTO.setRoomName("Test Room");
        sampleRoomDTO.setType(RoomType.PUBLIC);
        sampleRoomDTO.setOwnerId(1);

        // Setup mock session
        mockSession = new MockHttpSession();
    }

    @Test
    void index_redirectsToIndexHtml() throws Exception {
        mockMvc.perform(get("/rooms/"))
                .andExpect(status().isOk())
                .andExpect(content().string("redirect:/index.html"));
    }

    @Test
    void getAllRooms_returnsListOfRooms() throws Exception {
        Mockito.when(roomService.findAllRooms())
                .thenReturn(Arrays.asList(sampleRoom));

        mockMvc.perform(get("/rooms/data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].roomId", is(1)))
                .andExpect(jsonPath("$[0].roomName", is("Test Room")))
                .andExpect(jsonPath("$[0].type", is("PUBLIC")));
    }

    @Test
    void getRoomById_returnsRoom() throws Exception {
        Mockito.when(roomService.findRoomById(1)).thenReturn(sampleRoom);

        mockMvc.perform(get("/rooms/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId", is(1)))
                .andExpect(jsonPath("$.roomName", is("Test Room")));
    }

    @Test
    void getPublicRooms_returnsPublicRooms() throws Exception {
        Mockito.when(roomService.findAllPubRooms())
                .thenReturn(Arrays.asList(sampleRoom));

        mockMvc.perform(get("/rooms/getPub"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].roomId", is(1)))
                .andExpect(jsonPath("$[0].type", is("PUBLIC")));
    }

    @Test
    void createRoom_success_asAdmin() throws Exception {
        mockSession.setAttribute("user", adminUser);
        Room newRoom = new Room();
        newRoom.setRoomName("New Room");

        Mockito.when(userService.findAll()).thenReturn(Arrays.asList(adminUser, regularUser));
        Mockito.when(roomService.createRoom(any(Room.class))).thenReturn(sampleRoom);

        mockMvc.perform(post("/rooms")
                .session(mockSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newRoom)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roomId", is(1)))
                .andExpect(jsonPath("$.roomName", is("Test Room")));
    }

    @Test
    void createRoom_unauthorized_noUser() throws Exception {
        Room newRoom = new Room();
        newRoom.setRoomName("New Room");

        mockMvc.perform(post("/rooms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newRoom)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Unauthorized"));
    }

    @Test
    void createRoom_forbidden_notAdmin() throws Exception {
        mockSession.setAttribute("user", regularUser);
        Room newRoom = new Room();
        newRoom.setRoomName("New Room");

        mockMvc.perform(post("/rooms")
                .session(mockSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newRoom)))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Forbidden"));
    }

    @Test
    void createPrivateRoom_success_asRegularUser() throws Exception {
        mockSession.setAttribute("user", regularUser);
        Room newRoom = new Room();
        newRoom.setRoomName("Private Room");

        Room savedRoom = new Room();
        savedRoom.setRoomId(2);
        savedRoom.setRoomName("Private Room");
        savedRoom.setType(RoomType.PRIVATE);

        Mockito.when(roomService.createRoom(any(Room.class))).thenReturn(savedRoom);

        mockMvc.perform(post("/rooms/createPR")
                .session(mockSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newRoom)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roomId", is(2)))
                .andExpect(jsonPath("$.type", is("PRIVATE")));
    }

    @Test
    void createPrivateRoom_forbidden_notRegularUser() throws Exception {
        mockSession.setAttribute("user", adminUser);
        Room newRoom = new Room();
        newRoom.setRoomName("Private Room");

        mockMvc.perform(post("/rooms/createPR")
                .session(mockSession)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newRoom)))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Forbidden"));
    }

    @Test
    void joinPrivateRoom_success() throws Exception {
        mockSession.setAttribute("user", regularUser);
        Mockito.when(roomService.joinRoom(regularUser, "ABC123")).thenReturn(1);

        mockMvc.perform(post("/rooms/joinPR")
                .session(mockSession)
                .param("joinCode", "ABC123"))
                .andExpect(status().isOk());
    }

    @Test
    void joinPrivateRoom_alreadyMember() throws Exception {
        mockSession.setAttribute("user", regularUser);
        Mockito.when(roomService.joinRoom(regularUser, "ABC123")).thenReturn(2);

        mockMvc.perform(post("/rooms/joinPR")
                .session(mockSession)
                .param("joinCode", "ABC123"))
                .andExpect(status().isConflict())
                .andExpect(content().string("Already a member of this room"));
    }

    @Test
    void joinPrivateRoom_roomNotFound() throws Exception {
        mockSession.setAttribute("user", regularUser);
        Mockito.when(roomService.joinRoom(regularUser, "INVALID")).thenReturn(3);

        mockMvc.perform(post("/rooms/joinPR")
                .session(mockSession)
                .param("joinCode", "INVALID"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Room not found with join code: INVALID"));
    }

    @Test
    void joinPrivateRoom_unauthorized() throws Exception {
        mockMvc.perform(post("/rooms/joinPR")
                .param("joinCode", "ABC123"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Unauthorized"));
    }

    @Test
    void getUsersByRoomId_returnsUsers() throws Exception {
        List<User> users = Arrays.asList(adminUser, regularUser);
        Mockito.when(roomService.findUsersByRoomId(1)).thenReturn(users);

        mockMvc.perform(get("/rooms/users")
                .param("roomId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].userId", is(1)))
                .andExpect(jsonPath("$[1].userId", is(2)));
    }

    @Test
    void updateRoom_success() throws Exception {
        Room updatedRoom = new Room();
        updatedRoom.setRoomName("Updated Room");
        updatedRoom.setType(RoomType.PRIVATE);

        Mockito.when(roomService.findRoomById(1)).thenReturn(sampleRoom);
        Mockito.when(roomService.createRoom(any(Room.class))).thenReturn(updatedRoom);

        mockMvc.perform(put("/rooms/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedRoom)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomName", is("Updated Room")))
                .andExpect(jsonPath("$.type", is("PRIVATE")));
    }

    @Test
    void deleteRoom_success() throws Exception {
        mockMvc.perform(delete("/rooms/1"))
                .andExpect(status().isNoContent());

        Mockito.verify(roomService).deleteRoom(1);
    }

    @Test
    void getVisibleRooms_asAdmin() throws Exception {
        mockSession.setAttribute("user", adminUser);
        List<RoomDTO> rooms = Arrays.asList(sampleRoomDTO);
        Mockito.when(roomService.findAllPublicRoomsWithUsers()).thenReturn(rooms);

        mockMvc.perform(get("/rooms/visible")
                .session(mockSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].roomId", is(1)));
    }

    @Test
    void getVisibleRooms_asRegularUser() throws Exception {
        mockSession.setAttribute("user", regularUser);
        List<RoomDTO> rooms = Arrays.asList(sampleRoomDTO);
        Mockito.when(roomService.findRoomsForNonOwnerUser(2)).thenReturn(rooms);

        mockMvc.perform(get("/rooms/visible")
                .session(mockSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].roomId", is(1)));
    }

    @Test
    void getVisibleRooms_unauthorized() throws Exception {
        mockMvc.perform(get("/rooms/visible"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void forceDeletePost_success_asAdmin() throws Exception {
        mockSession.setAttribute("user", adminUser);

        mockMvc.perform(delete("/rooms/forceDelete/1")
                .session(mockSession))
                .andExpect(status().isNoContent())
                .andExpect(content().string("Post with ID 1 force deleted."));

        Mockito.verify(roomService).PostForceDelete(1);
    }

    @Test
    void forceDeletePost_forbidden_notAdmin() throws Exception {
        mockSession.setAttribute("user", regularUser);

        mockMvc.perform(delete("/rooms/forceDelete/1")
                .session(mockSession))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Only admins can force delete posts"));
    }

    @Test
    void forceDeletePost_unauthorized() throws Exception {
        mockMvc.perform(delete("/rooms/forceDelete/1"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("User not authenticated"));
    }

    @Test
    void deletePost_success() throws Exception {
        mockMvc.perform(delete("/rooms/delete/1/2"))
                .andExpect(status().isNoContent())
                .andExpect(content().string("Post with ID 1 deleted."));

        Mockito.verify(roomService).PostDelete(1, 2);
    }

    @Test
    void extreme_emptyListAndExceptions() throws Exception {
        // Test empty room list
        Mockito.when(roomService.findAllRooms()).thenReturn(Arrays.asList());
        mockMvc.perform(get("/rooms/data"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Test null return
        Mockito.when(roomService.findRoomById(999)).thenReturn(null);
        mockMvc.perform(get("/rooms/999"))
                .andExpect(status().isOk())
                .andExpect(content().string(""));
    }
}