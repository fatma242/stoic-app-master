package com.example.stoic.Progress.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.stoic.Progress.Model.MoodLog;
import com.example.stoic.Progress.Repo.MoodLogRepository;

@CrossOrigin(origins = {
        "http://192.168.1.6:8081",
        "http://192.168.20.179:8081",
        "exp://192.168.20.179:8081",
        "exp://192.168.1.6:8081",
        "exp://192.168.210.193:8081",
        "http://localhost:8081",
}, allowCredentials = "true")
@RestController
@RequestMapping("/api/mood-logs")
public class MoodLogController {

    @Autowired
    private MoodLogRepository repo;

    @PostMapping
    public MoodLog saveMood(@RequestBody MoodLog moodLog) {
        return repo.save(moodLog);
    }

    @GetMapping("/{userId}")
    public List<MoodLog> getMoods(@PathVariable String userId) {
        return repo.findByUserIdOrderByTimestampAsc(userId);
    }
}
