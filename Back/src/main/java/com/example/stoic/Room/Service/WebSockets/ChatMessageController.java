package com.example.stoic.Room.Service.WebSockets;

import com.example.stoic.Room.dto.ChatMessageDto;
import com.example.stoic.Message.Model.Message;
import com.example.stoic.Message.Service.MessageService;
import com.example.stoic.Room.Model.Room;
import com.example.stoic.Room.Service.RoomService;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatMessageController {

    private final MessageService messageService;
    private final RoomService roomService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public ChatMessageController(
            MessageService messageService,
            RoomService roomService,
            UserService userService,
            SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.roomService = roomService;
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * STOMP endpoint: clients send to "/app/chat.send/{roomId}"
     */
    @MessageMapping("/chat.send/{roomId}")
    public void sendToRoom(
            @DestinationVariable Long roomId,
            ChatMessageDto dto) {
        // 1) Load Room and User entities
        Room room = roomService.findRoomById(roomId.intValue());
        User sender = userService.findById(dto.getSenderId());

        // 2) Persist the message
        Message saved = messageService.save(dto.toEntity(room, sender));

        // 3) Broadcast to all subscribers of "/topic/rooms/{roomId}"
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId,
                ChatMessageDto.fromEntity(saved));
    }
}
