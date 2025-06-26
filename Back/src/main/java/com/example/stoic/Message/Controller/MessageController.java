package com.example.stoic.Message.Controller;

import com.example.stoic.Message.Model.Message;
import com.example.stoic.Message.Service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = {
        "http://192.168.1.2:8081",
        "exp://192.168.1.2:8081"
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

    // REST: room history
    @GetMapping("/rooms/{roomId}/history")
    public List<Message> getRoomHistory(@PathVariable int roomId) {
        return service.getRoomHistory(roomId);
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
