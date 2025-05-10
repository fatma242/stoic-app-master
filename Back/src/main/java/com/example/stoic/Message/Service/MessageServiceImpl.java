package com.example.stoic.Message.Service;
import com.example.stoic.Message.Service.MessageService;
import com.example.stoic.Message.Model.Message;
import com.example.stoic.Message.Repo.MessageRepo;
import com.example.stoic.Message.Service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepo repo;

    @Override
    public Message save(Message message) {
        message.setSentAt(LocalDateTime.now());
        return repo.save(message);
    }

    @Override
    public List<Message> getRoomHistory(String roomId) {
        Specification<Message> spec = (root, query, cb) -> cb.equal(root.get("roomId"), roomId);
        return repo.findAll(spec, Sort.by("sentAt"));
    }

    @Override
    public List<Message> getBySender(String senderId) {
        Specification<Message> spec = (root, query, cb) -> cb.equal(root.get("senderId"), senderId);
        return repo.findAll(spec, Sort.by("sentAt"));
    }

    @Override
    public List<Message> getBetween(LocalDateTime from, LocalDateTime to) {
        Specification<Message> spec = (root, query, cb) -> cb.between(root.get("sentAt"), from, to);
        return repo.findAll(spec, Sort.by("sentAt"));
    }
}
