package com.example.stoic.ChatMessage.Repo;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.stoic.ChatMessage.Model.ChatMessage;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    List<ChatMessage> findByUserIdOrderByTimestampAsc(long userId);
    void deleteByUserId(long userId);
    void deleteById(Long id);
}

