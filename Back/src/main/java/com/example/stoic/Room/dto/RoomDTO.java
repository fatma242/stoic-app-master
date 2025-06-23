package com.example.stoic.Room.dto;

import lombok.Data;
import java.util.Date;

import com.example.stoic.Room.Model.RoomType;


@Data
public class RoomDTO {
    private int roomId;
    private int ownerId;
    private String roomName;
    private RoomType type;
    private Date createdAt;
} 
