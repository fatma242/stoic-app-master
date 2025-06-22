package com.example.stoic.Room.dto;

import com.example.stoic.Message.Model.Message;
import com.example.stoic.Room.Model.Room;
import com.example.stoic.User.Model.User;

import java.time.LocalDateTime;

public class ChatMessageDto {
  private int roomId;
  private int senderId;
  private String content;
  private LocalDateTime sentAt;

  public ChatMessageDto() {
  }

  // Getters and setters
  public int getRoomId() {
    return roomId;
  }

  public void setRoomId(int roomId) {
    this.roomId = roomId;
  }

  public int getSenderId() {
    return senderId;
  }

  public void setSenderId(int senderId) {
    this.senderId = senderId;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public LocalDateTime getSentAt() {
    return sentAt;
  }

  public void setSentAt(LocalDateTime sentAt) {
    this.sentAt = sentAt;
  }

  /**
   * Build a Message entity once you have Room and User objects.
   */
  public Message toEntity(Room room, User sender) {
    Message msg = new Message();
    msg.setRoom(room);
    msg.setSender(sender);
    msg.setContent(this.content);
    msg.setSentAt(this.sentAt != null ? this.sentAt : LocalDateTime.now());
    return msg;
  }

  /**
   * Convert a Message entity back into DTO form (extract IDs).
   */
  public static ChatMessageDto fromEntity(Message m) {
    ChatMessageDto dto = new ChatMessageDto();
    dto.setRoomId(m.getRoom().getRoomId());
    dto.setSenderId(m.getSender().getUserId());
    dto.setContent(m.getContent());
    dto.setSentAt(m.getSentAt());
    return dto;
  }
}
