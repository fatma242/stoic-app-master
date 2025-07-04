package com.example.stoic.ChatMessage.Controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.stoic.ChatMessage.Model.ChatMessage;
import com.example.stoic.ChatMessage.Repo.ChatMessageRepository;

import java.util.List;


@CrossOrigin(origins = {
        "${UserIphttp}",
        "${UserIPexp}",
        "${UserIphttp}"
}, allowCredentials = "true")
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;

    public ChatController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @PostMapping("/save")
    public ResponseEntity<Void> saveMessage(@RequestBody ChatMessage message) {
        message.setTimestamp(java.time.LocalDateTime.now());
        chatMessageRepository.save(message);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable Long userId) {
        return ResponseEntity.ok(chatMessageRepository.findByUserIdOrderByTimestampAsc(userId));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteMessages(@PathVariable Long userId) {
        chatMessageRepository.deleteByUserId(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/message/{id}")
    public ResponseEntity<Void> deleteSingleMessage(@PathVariable Long id) {
        chatMessageRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}