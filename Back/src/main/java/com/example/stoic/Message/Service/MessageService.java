// Service interface
package com.example.stoic.Message.Service;

import com.example.stoic.Message.Model.Message;
import java.time.LocalDateTime;
import java.util.List;

public interface MessageService {
    Message save(Message message);
    List<Message> getRoomHistory(String roomId);
    List<Message> getBySender(String senderId);
    List<Message> getBetween(LocalDateTime from, LocalDateTime to);
}