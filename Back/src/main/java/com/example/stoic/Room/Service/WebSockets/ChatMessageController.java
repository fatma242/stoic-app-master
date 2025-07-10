package com.example.stoic.Room.Service.WebSockets;

import com.example.stoic.Notification.Model.Notification;
import com.example.stoic.Notification.Model.NotificationType;
import com.example.stoic.Notification.Service.NotificationService;
import com.example.stoic.Room.dto.ChatMessageDto;
import com.example.stoic.Message.Model.Message;
import com.example.stoic.Message.Service.MessageService;
import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.Service.RoomService;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatMessageController {

    private final MessageService messageService;
    private final RoomService roomService;
    private final UserService userService;

    private final NotificationService notificationService; // new!
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send/{roomId}")
    public void sendToRoom(
            @DestinationVariable int roomId,
            ChatMessageDto dto) {

        Room room = roomService.findRoomById(roomId);
        User sender = userService.findById(dto.getSenderId());
        Message saved = messageService.save(dto.toEntity(room, sender));

        // Broadcast to everyone in the room
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId,
                ChatMessageDto.fromEntity(saved));

        // Get all users in the room
        List<User> roomUsers = roomService.findUsersByRoomId(roomId);

        // Notify everyone EXCEPT the sender
        for (User recipient : roomUsers) {
            // Skip notification if recipient is the sender
            if (recipient.getUserId() == sender.getUserId()) {
                System.out.println("Skipping self-notification for user: " + recipient.getUsername());
                continue;
            }

            Notification notif = new Notification();
            notif.setUser(recipient);
            notif.setType(NotificationType.MESSAGE);
            notif.setContent(sender.getUsername() + ": " + saved.getContent());
            notif.setSentAt(LocalDateTime.now());
            notif.setRead(false);

            // Create notification in database
            notificationService.createNotification(notif);

            // Send real-time notification
            messagingTemplate.convertAndSendToUser(
                    recipient.getUsername(),
                    "/queue/notifications",
                    notif);

            System.out.println("Sent notification to: " + recipient.getUsername());
        }
    }
}
