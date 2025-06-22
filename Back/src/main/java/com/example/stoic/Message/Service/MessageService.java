package com.example.stoic.Message.Service;

import com.example.stoic.Message.Model.Message;
import java.time.LocalDateTime;
import java.util.List;

public interface MessageService {
    Message save(Message message);

    List<Message> getRoomHistory(int roomId);

    List<Message> getBySender(int senderId);

    List<Message> getBetween(LocalDateTime from, LocalDateTime to);
}
