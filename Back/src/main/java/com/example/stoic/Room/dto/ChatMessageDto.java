package com.example.stoic.Room.dto;

import com.example.stoic.Message.Model.Message;
import com.example.stoic.Room.Model.Room;
import com.example.stoic.User.Model.User;

import java.time.LocalDateTime;

public class ChatMessageDto {
  private int roomId;
  private int senderId;
  private String senderName; // ✅ Add this
  private String content;
  private LocalDateTime sentAt;

  public ChatMessageDto() {}

  // ✅ Getters and Setters
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

  public String getSenderName() {
    return senderName;
  }

  public void setSenderName(String senderName) {
    this.senderName = senderName;
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
   * Convert DTO to entity using room and sender.
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
   * Convert entity to DTO including sender name.
   */
  public static ChatMessageDto fromEntity(Message m) {
    ChatMessageDto dto = new ChatMessageDto();
    dto.setRoomId(m.getRoom().getRoomId());
    dto.setSenderId(m.getSender().getUserId());
    dto.setSenderName(m.getSender().getUsername()); // ✅ Get name from sender
    dto.setContent(m.getContent());
    dto.setSentAt(m.getSentAt());
    return dto;
  }
}
