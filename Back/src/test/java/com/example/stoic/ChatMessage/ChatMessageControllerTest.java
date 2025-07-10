package com.example.stoic.ChatMessage;

import com.example.stoic.Notification.Model.Notification;
import com.example.stoic.Notification.Model.NotificationType;
import com.example.stoic.Notification.Service.NotificationService;
import com.example.stoic.Room.dto.ChatMessageDto;
import com.example.stoic.Message.Model.Message;
import com.example.stoic.Message.Service.MessageService;
import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.Service.RoomService;
import com.example.stoic.Room.Service.WebSockets.ChatMessageController;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatMessageControllerTest {

        @Mock
        MessageService messageService;
        @Mock
        RoomService roomService;
        @Mock
        UserService userService;
        @Mock
        NotificationService notificationService;
        @Mock
        SimpMessagingTemplate messagingTemplate;

        @InjectMocks
        private ChatMessageController controller;

        private Room room;
        private User sender, bob, carol;
        private ChatMessageDto dto;
        private Message savedMessage;

        @BeforeEach
        void setUp() {
                // Set up room and users
                room = new Room();
                room.setRoomId(42);

                sender = new User();
                sender.setUserId(1);
                sender.setUsername("alice");
                bob = new User();
                bob.setUserId(2);
                bob.setUsername("bob");
                carol = new User();
                carol.setUserId(3);
                carol.setUsername("carol");

                // DTO to send
                dto = new ChatMessageDto();
                dto.setSenderId(1);
                dto.setContent("Hello, world");

                // What save(...) returns
                savedMessage = new Message();
                savedMessage.setId(100L);
                savedMessage.setContent("Hello, world");
                savedMessage.setSentAt(LocalDateTime.now());
                savedMessage.setRoom(room);
                savedMessage.setSender(sender);

                // Mock lookups
                when(roomService.findRoomById(42)).thenReturn(room);
                when(userService.findById(1)).thenReturn(sender);
                when(messageService.save(any())).thenReturn(savedMessage);

                // Return all users (including sender)
                when(roomService.findUsersByRoomId(42))
                                .thenReturn(Arrays.asList(sender, bob, carol));
        }

        @Test
        void sendToRoom_broadcastsAndNotifies() {
                controller.sendToRoom(42, dto);

                // 1) messageService.save(...)
                verify(messageService).save(argThat(msg -> msg.getContent().equals("Hello, world") &&
                                msg.getRoom() == room &&
                                msg.getSender() == sender));

                // 2) broadcast to /topic/rooms/42
                verify(messagingTemplate)
                                .convertAndSend(eq("/topic/rooms/42"), any(ChatMessageDto.class));

                // 3) create notifications for bob & carol
                verify(notificationService, times(2))
                                .createNotification(argThat(n -> (n.getUser() == bob || n.getUser() == carol) &&
                                                n.getType() == NotificationType.MESSAGE &&
                                                n.getContent().startsWith("alice: ")));

                // 4) send real‑time to bob & carol
                verify(messagingTemplate).convertAndSendToUser(
                                eq("bob"), eq("/queue/notifications"), any(Notification.class));
                verify(messagingTemplate).convertAndSendToUser(
                                eq("carol"), eq("/queue/notifications"), any(Notification.class));

                // 5) never notify alice
                verify(messagingTemplate, never())
                                .convertAndSendToUser(eq("alice"), anyString(), any());
        }

        @Test
        void sendToRoom_doesNotNotifyIfNoOtherUsers() {
                // Only sender in the room
                when(roomService.findUsersByRoomId(42)).thenReturn(Arrays.asList(sender));
                controller.sendToRoom(42, dto);

                // Should not notify anyone
                verify(notificationService, never()).createNotification(any());
                verify(messagingTemplate, never()).convertAndSendToUser(anyString(), anyString(), any());
        }

        @Test
        void sendToRoom_savesMessageWithCorrectFields() {
                controller.sendToRoom(42, dto);

                // Check that the saved message has correct content, room, and sender
                verify(messageService).save(argThat(msg -> msg.getContent().equals("Hello, world") &&
                                msg.getRoom() == room &&
                                msg.getSender() == sender));
        }

        @Test
        void sendToRoom_broadcastsToCorrectTopic() {
                controller.sendToRoom(42, dto);

                verify(messagingTemplate).convertAndSend(eq("/topic/rooms/42"), any(ChatMessageDto.class));
        }
}
