package com.example.stoic.Message.Controller;

import com.example.stoic.Message.Model.Message;
import com.example.stoic.Message.Service.MessageService;
import com.example.stoic.Room.dto.ChatMessageDto;
import com.google.cloud.storage.Acl.User;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = {
    "${UserIphttp}",          // Web on phone using LAN
    "${UserIPexp}",
    "${UserIphttp}"
}, allowCredentials = "true")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService service;

    // WebSocket endpoint for real-time chat
    @MessageMapping("/chat.send")
    @SendTo("/topic/messages")
    public Message sendMessage(@RequestBody Message message) {
        return service.save(message);
    }

    // REST endpoint: create message
    @PostMapping
    public Message create(@RequestBody Message message) {
        return service.save(message);
    }

    // ✅ REST: room history with senderName and sentAt
    @GetMapping("/rooms/{roomId}/history")
    public List<ChatMessageDto> getRoomHistory(@PathVariable int roomId) {
        return service.getRoomHistory(roomId).stream()
                .map(ChatMessageDto::fromEntity)
                .toList();
    }

    // REST: by sender
    @GetMapping("/sender/{senderId}")
    public List<Message> getBySender(@PathVariable int senderId) {
        return service.getBySender(senderId);
    }

    // REST: between dates
    @GetMapping("/between")
    public List<Message> getBetween(@RequestParam LocalDateTime from,
                                    @RequestParam LocalDateTime to) {
        return service.getBetween(from, to);
    }
}
