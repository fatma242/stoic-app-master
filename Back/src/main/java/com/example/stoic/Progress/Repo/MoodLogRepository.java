package com.example.stoic.Progress.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.stoic.Progress.Model.MoodLog;

public interface MoodLogRepository extends JpaRepository<MoodLog, Long> {
    List<MoodLog> findByUserIdOrderByTimestampAsc(String userId);
}
