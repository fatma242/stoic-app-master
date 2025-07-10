package com.example.stoic.Message.Service;

import com.example.stoic.Message.Model.Message;
import com.example.stoic.Message.Repo.MessageRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional // every public method in this class is transactional

public class MessageServiceImpl implements MessageService {

    private final MessageRepo repo;

    @Override
    public Message save(Message message) {
        message.setSentAt(LocalDateTime.now());
        return repo.save(message);
    }

    @Override
    public List<Message> getRoomHistory(int roomId) {
        Specification<Message> spec = (root, query, cb) -> cb.equal(root.get("room").get("roomId"), roomId);
        return repo.findAll(spec, Sort.by("sentAt").ascending());
    }

    @Override
    public List<Message> getBySender(int senderId) {
        Specification<Message> spec = (root, query, cb) -> cb.equal(root.get("sender").get("userId"), senderId);
        return repo.findAll(spec, Sort.by("sentAt").ascending());
    }

    @Override
    public List<Message> getBetween(LocalDateTime from, LocalDateTime to) {
        Specification<Message> spec = (root, query, cb) -> cb.between(root.get("sentAt"), from, to);
        return repo.findAll(spec, Sort.by("sentAt").ascending());
    }
}
